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
            const response = await fetch("/api/v1/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    fullName: nome,
                    email: emailInput,
                    password,
                }),
            });

            const result = await response.json();

            if (!result.error) {
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

<Alert type={alertType} message={alertMessage} show={showAlert} />

<div class="container mx-auto flex flex-col items-center justify-start pt-16 px-4">
    <h1 class="text-3xl font-bold text-center text-[#cba6f7] mb-8">Register</h1>
    <div class="w-full max-w-md">
        <form
            on:submit={handleRegister}
            class="backdrop-blur-lg bg-[#1e1e2e]/70 border border-[#6e6c7e]/20 rounded-xl shadow-xl p-6"
        >
            <div class="mb-4">
                <label class="block text-[#cdd6f4] text-sm font-bold mb-2" for="username">
                    Username
                </label>
                <input
                    class="w-full bg-[#313244]/50 border border-[#6e6c7e]/50 rounded-lg py-2 px-3 
                           text-[#cdd6f4] placeholder-[#6e6c7e] leading-tight
                           focus:ring-2 focus:ring-[#89b4fa] focus:border-[#89b4fa] transition-all duration-200"
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    required
                />
            </div>

            <div class="mb-4">
                <label class="block text-[#cdd6f4] text-sm font-bold mb-2" for="nome">
                    Display Name
                </label>
                <input
                    class="w-full bg-[#313244]/50 border border-[#6e6c7e]/50 rounded-lg py-2 px-3 
                           text-[#cdd6f4] placeholder-[#6e6c7e] leading-tight
                           focus:ring-2 focus:ring-[#89b4fa] focus:border-[#89b4fa] transition-all duration-200"
                    id="nome"
                    type="text"
                    name="nome"
                    placeholder="Enter display name"
                    required
                />
            </div>

            <div class="mb-4">
                <label class="block text-[#cdd6f4] text-sm font-bold mb-2" for="email">
                    Email
                </label>
                <input
                    class="w-full bg-[#313244]/50 border border-[#6e6c7e]/50 rounded-lg py-2 px-3 
                           text-[#cdd6f4] placeholder-[#6e6c7e] leading-tight
                           focus:ring-2 focus:ring-[#89b4fa] focus:border-[#89b4fa] transition-all duration-200"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    required
                    bind:value={emailInput}
                />
            </div>

            <div class="mb-6">
                <label class="block text-[#cdd6f4] text-sm font-bold mb-2" for="password">
                    Password
                </label>
                <input
                    class="w-full bg-[#313244]/50 border border-[#6e6c7e]/50 rounded-lg py-2 px-3 
                           text-[#cdd6f4] placeholder-[#6e6c7e] leading-tight
                           focus:ring-2 focus:ring-[#89b4fa] focus:border-[#89b4fa] transition-all duration-200"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    required
                />
            </div>

            <button
                class="w-full bg-gradient-to-r from-[#89b4fa] to-[#cba6f7] hover:from-[#74c7ec] hover:to-[#f5c2e7] 
                       text-[#1e1e2e] font-bold py-2.5 px-4 rounded-lg transition-all duration-300 
                       shadow-lg hover:shadow-[#89b4fa]/25"
                type="submit"
            >
                Register
            </button>
        </form>
    </div>
</div>