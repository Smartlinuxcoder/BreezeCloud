<script>
    import Alert from "$lib/components/Alert.svelte";
    import { onMount } from "svelte";

    let showAlert = false;
    let alertMessage = "";
    let alertType = "info";
    let emailInput = "";
    let emailInputElement;

    const handleRegister = async (event) => {
        event.preventDefault();

        const username = event.target.elements.username.value;
        const nome = event.target.elements.nome.value;
        const password = event.target.elements.password.value;

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    nome,
                    email: emailInput,
                    password,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alertType = "success";
                alertMessage = "Registration successful!";
            } else {
                alertType = "error";
                alertMessage = result.message || "Registration failed.";
            }
        } catch (error) {
            alertType = "error";
            alertMessage = "An unexpected error occurred.";
        } finally {
            showAlert = true;
        }
    };
</script>

<!-- Use the alert component -->
<Alert type={alertType} message={alertMessage} show={showAlert} />

<div
    class="container mx-auto flex flex-col items-center justify-start pt-16 px-4"
>
    <h1 class="text-3xl font-bold text-center text-[#EB3678] mb-8">
        Register
    </h1>
    <div class="w-full max-w-md">
        <form
            on:submit={handleRegister}
            class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
        >
            <div class="mb-4">
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="username"
                >
                    Username
                </label>
                <input
                    class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Username utente"
                    required
                />
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="nome"
                >
                    Display name
                </label>
                <input
                    class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
                    id="nome"
                    type="text"
                    name="nome"
                    placeholder="Nome utente"
                    required
                />
            </div>
            <div class="mb-4">
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="email"
                >
                    Email
                </label>
                <div class="relative">
                    <input
                        class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
                        id="email"
                        type="text"
                        name="email"
                        placeholder="Email"
                        required
                        bind:value={emailInput}
                    />
                </div>
            </div>
            <div class="mb-6">
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="password"
                >
                    Password
                </label>
                <input
                    class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="******************"
                    required
                />
            </div>
            <div class="flex items-center justify-between">
                <button
                    class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-200"
                    type="submit"
                >
                    Registrati
                </button>
            </div>
        </form>
    </div>
</div>
