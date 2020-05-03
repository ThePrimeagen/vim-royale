import dotenv from 'dotenv';
dotenv.config();

process.env.LOGGER_TYPE = 'log';
process.env.SUPPRESS_LOGS = 'true';
process.env.RENDER = 'false';
console.log("SET RENDER");

jest.doMock('blessed', () => {
    return {
        box: () => {
            return {
                setContent: jest.fn()
            };
        },
    };
});

export default function() {
    console.log("DID IT");
}
