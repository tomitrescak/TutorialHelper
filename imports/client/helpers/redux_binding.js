import update from 'react-addons-update';
function createSelector(mainSelectorText, selectorText) {
    // construct selector
    const selector = {};
    let selectorPart = selector;
    if (mainSelectorText) {
        mainSelectorText.split('.').forEach(elem => {
            let newPart = {};
            selectorPart[elem] = newPart;
            selectorPart = newPart;
        });
    }
    selectorText.split('.').forEach(elem => {
        let newPart = {};
        selectorPart[elem] = newPart;
        selectorPart = newPart;
    });
    return function (act, value) {
        selectorPart[act] = value;
        return selector;
    };
}
let timeout;
let lastSelector;
export function createBinder(store) {
    return function initBinder(actionName, mainSelectorText = null) {
        return function bind(selectorText, updateAction = 'set') {
            const selector = createSelector(mainSelectorText, selectorText);
            const currentSelector = JSON.stringify(selector);
            return function changed(e) {
                // we dispatch only if user finished typing
                if (timeout && currentSelector === lastSelector) {
                    clearTimeout(timeout);
                }
                let value = e.currentTarget['value'];
                timeout = setTimeout(() => {
                    store.dispatch({
                        type: actionName,
                        selector,
                        action: updateAction,
                        value
                    });
                }, 300);
                lastSelector = currentSelector;
            };
        };
    };
}
export function bindingReducer(actionName) {
    return function (state, action) {
        if (action.type === actionName) {
            const act = '$' + (action.action ? action.action : 'set');
            const updateSelector = action.selector(act, action.value);
            return update(state, updateSelector);
        }
        return null;
    };
}
