<script>
    export let type = ""; // can be 'success', 'error', 'warning', or 'info'
    export let message = "";
    export let show = false; // controls whether the alert is visible
    const alertTypes = {
        success: "bg-green-100 text-green-800 border-green-400",
        error: "bg-red-100 text-red-800 border-red-400",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
        info: "bg-blue-100 text-blue-800 border-blue-400",
    };
    $: alertStyle = alertTypes[type] || alertTypes.info;

</script>

{#if show}
    <div class={`border ${alertStyle} px-4 py-3 rounded relative`} role="alert">
        <span class="block sm:inline">{message}</span>
        <button
            on:click={() => (show = false)}
            class="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
            <svg
                class="fill-current h-6 w-6 text-gray-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
            >
                <title>Close</title>
                <path
                    d="M14.348 5.652a1 1 0 010 1.414L11.414 10l2.934 2.934a1 1 0 11-1.414 1.414L10 11.414l-2.934 2.934a1 1 0 01-1.414-1.414L8.586 10 5.652 7.066a1 1 0 111.414-1.414L10 8.586l2.934-2.934a1 1 0 011.414 0z"
                />
            </svg>
        </button>
    </div>
{/if}
