use std::sync::{Arc, Mutex};
use std::fmt::Debug;

use futures::{channel::mpsc::{Sender, Receiver}, StreamExt};
use leptos::{spawn_local, use_context, Scope};

pub trait Reactor<S, T, Out>
where
    S: 'static,
{
    fn should(&self, msg: &T) -> bool;
    fn call(&mut self, state: &'static S, msg: &T, out: Sender<Out>);
}

type Callbacks<S, T, Out> = Arc<Mutex<Vec<Box<dyn Reactor<S, T, Out>>>>>;

pub struct StateReactor<S, T, Out>
where
    S: 'static,
{
    callbacks: Callbacks<S, T, Out>,
    pub tx: Sender<T>,
}

impl<S, T, Out> StateReactor<S, T, Out>
where
    S: 'static,
    T: Clone + 'static + Debug,
    Out: Clone + 'static,
{
    pub fn new(cx: Scope, out: Sender<Out>) -> Self {
        let (tx, rx) = futures::channel::mpsc::channel::<T>(3);
        let callbacks: Callbacks<S, T, Out> = Arc::new(Mutex::new(vec![]));
        let inner_callbacks = callbacks.clone();

        spawn_local(async move {
            let mut rx: Receiver<_> = rx;
            let callbacks = inner_callbacks.clone();
            let state: &'static S =
                use_context::<&'static S>(cx).expect("There should always be a state");

            while let Some(msg) = rx.next().await {
                let mut callbacks = callbacks
                    .lock()
                    .expect("i am unsure how this would ever fail.");

                leptos::log!("help me tom cruise {:?}", msg);

                for callback in callbacks.iter_mut() {
                    if callback.should(&msg) {
                        callback.call(state, &msg, out.clone());
                    }
                }
            }
        });

        return StateReactor { callbacks, tx };
    }

    pub fn register_callback(&self, callback: Box<dyn Reactor<S, T, Out>>) {
        let mut callbacks = self
            .callbacks
            .lock()
            .expect("i am unsure how this would ever fail.");

        callbacks.push(callback);
    }
}
