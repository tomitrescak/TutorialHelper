export const TOGGLE_MARKED = 'Marking: Toggle Marked';
export const TOGGLE_PENDING = 'Marking: Toggle Pending';
export function toggleMarked() {
    return {
        type: TOGGLE_MARKED
    };
}
export function togglePending() {
    return {
        type: TOGGLE_PENDING
    };
}
