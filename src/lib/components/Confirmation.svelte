<script>

    import { confirmModal } from "$lib/stores/modal";
</script>

{#if $confirmModal.show}
    <div
        class="fixed inset-0 bg-[#181825]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
        <div
            class="bg-[#1E1E2E] rounded-xl max-w-md w-full p-6"
            on:click|stopPropagation
        >
            <h3 class="text-xl font-semibold text-[#CDD6F4] mb-2">
                {$confirmModal.title}
            </h3>
            <p class="text-[#6C7086] mb-6">{$confirmModal.message}</p>
            <div class="flex justify-end gap-3">
                <button
                    class="px-4 py-2 rounded-lg hover:bg-[#313244] text-[#6C7086]"
                    on:click={() => {
                        $confirmModal.onCancel?.();
                        $confirmModal.show = false;
                    }}
                >
                    Cancel
                </button>
                <button
                    class="px-4 py-2 bg-[#F38BA8] hover:opacity-90 text-[#1E1E2E] rounded-lg"
                    on:click={() => {
                        $confirmModal.onConfirm?.();
                        $confirmModal.show = false;
                    }}
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
{/if}
