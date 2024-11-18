// Dados de exemplo para validação
const correctEmail = "usuario@example.com";
const correctPassword = "12345";

// Seleciona o botão de login e adiciona o evento de clique
document.querySelector(".btn").addEventListener("click", function(event) {
    event.preventDefault(); // Evita o envio do formulário padrão

    // Obtém os valores de e-mail e senha dos inputs
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Verifica se o e-mail e a senha estão corretos
    if (email === correctEmail && password === correctPassword) {
        // Redireciona para a página de início
        window.location.href = "inicio-index.html";
    } else {
        // Mostra um alerta caso o login falhe
        alert("Email ou senha incorretos. Tente novamente.");
    }
});
