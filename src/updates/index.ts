import {EventType, BinaryData, EventData, Run} from '../events';
import { readCreateEntity, isCreateEntity } from '../server/messages/createEntity';
import { isCorrectPosition, readCorrectPosition } from '../server/messages/correctPosition';
import { isGameStateUpdate, readGameStateUpdate } from '../server/messages/game-state-update';
import { GameStateType } from '../server/messages/types';
import GlobalContext, {LocalContext} from '../context';
import PositionComponent from '../objects/components/position';
import createLogger from '../logger';

const renderLoop = {type: EventType.Run} as Run;
const logger = createLogger("handleGameStateUpdate");

function handleGameStateUpdate(context: LocalContext, buffer: Buffer) {
    const stateUpdate = readGameStateUpdate(buffer, 1);

    logger("StateUpdate", stateUpdate);
    switch (stateUpdate.type) {
        case GameStateType.EntityMovement:
            let posComponent;
            if (context.store.setNewEntity(stateUpdate.entityId)) {
                posComponent = new PositionComponent(
                    stateUpdate.char, stateUpdate.x, stateUpdate.y);

                context.store.attachComponent(stateUpdate.entityId, posComponent);
            }

            // TODO: Fix me
            // @ts-ignore
            posComponent = context.store.getComponent<PositionComponent>(stateUpdate.entityId, PositionComponent);

            posComponent.x = stateUpdate.x;
            posComponent.y = stateUpdate.y;

            break;

        case GameStateType.RemoveEntityRange:
            const {
                from, to
            } = stateUpdate;

            context.store.removeEntityRange(from, to);
            break;
    }

    context.events.emit(renderLoop);
}

export default function handleBinaryMessage(context: LocalContext, evt: BinaryData, offset: number = 0) {
    const player = context.player;

    if (isCorrectPosition(evt.data, offset)) {
        const posCorrection = readCorrectPosition(evt.data, 1);

        player.forcePosition.x = posCorrection.x;
        player.forcePosition.y = posCorrection.y;
        player.forcePosition.movementId = posCorrection.nextId;
        player.forcePosition.force = true;
        context.events.emit({type: EventType.Run});
    }

    else if (isGameStateUpdate(evt.data, offset)) {
        handleGameStateUpdate(context, evt.data);
    }

    else if (isCreateEntity(evt.data, offset)) {
        logger("isCreateEntity", readCreateEntity(context, evt.data, offset + 1));
    }
}

