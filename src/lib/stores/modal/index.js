import { writable } from "svelte/store";

export const confirmModal = writable({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
});