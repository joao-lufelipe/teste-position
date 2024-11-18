
// navbar //
function toggleMenu() {
    const navList = document.getElementById("nav-list");
    const menuIcon = document.querySelector(".mobile-menu-icon");
    
    navList.classList.toggle("active");
    menuIcon.classList.toggle("active");
}
/////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    const tabelaResumo = document.getElementById('resumo-tabela').getElementsByTagName('tbody')[0];
    const tabelaEditar = document.getElementById('tabela-editar').getElementsByTagName('tbody')[0];
    const tooltip = document.getElementById('tooltip');
    const tooltipDetalhe = document.getElementById('tooltip-detalhe');
    const filtroTooltip = document.getElementById('filtro-tooltip');
    let tooltipAtivo = false;
    let tooltipDetalheAtivo = false;
    let turmas = {};
    let alunos = [];

    // Função para carregar o arquivo Excel
    function carregarArquivoExcel() {
        const url = 'notas_estudantes.xlsx';
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                processarDados(jsonData);
            })
            .catch(error => console.error("Erro ao carregar o arquivo Excel:", error));
    }

    // Função para processar os dados do Excel
    function processarDados(data) {
        data.slice(1).forEach(row => {
            const [nome, turma, nota1, nota2, nota3, nota4, faltas] = row;
            const media = (parseFloat(nota1) + parseFloat(nota2) + parseFloat(nota3) + parseFloat(nota4)) / 4;
            let situacao = calcularSituacao(media, faltas);

            if (!turmas[turma]) {
                turmas[turma] = {
                    mediaTotal: 0,
                    totalAlunos: 0,
                    totalFaltas: 0,
                    alunos: [],
                    situacoes: { "Aprovado": 0, "Reprovado por faltas": 0, "Reprovado por nota": 0, "Recuperação": 0 }
                };
            }

            turmas[turma].mediaTotal += media;
            turmas[turma].totalAlunos += 1;
            turmas[turma].totalFaltas += parseInt(faltas);
            turmas[turma].alunos.push({ nome, turma, nota1, nota2, nota3, nota4, media, situacao, faltas });
            turmas[turma].situacoes[situacao] += 1;
        });

        exibirResumo(turmas);

        alunos = data.slice(1).map(row => {
            const [nome, turma, nota1, nota2, nota3, nota4, faltas] = row;
            const media = (parseFloat(nota1) + parseFloat(nota2) + parseFloat(nota3) + parseFloat(nota4)) / 4;
            return { nome, turma, nota1, nota2, nota3, nota4, faltas, media };
        });
    }

    // Função para calcular a situação do aluno
    function calcularSituacao(media, faltas) {
        if (faltas > 10) return "Reprovado por faltas";
        if (media < 2) return "Reprovado por nota";
        if (media < 7) return "Recuperação";
        return "Aprovado";
    }

    // Função para exibir a tabela resumo com as médias das turmas
    function exibirResumo(turmas) {
        tabelaResumo.innerHTML = ''; // Limpa a tabela antes de preencher

        for (const turma in turmas) {
            const { mediaTotal, totalAlunos, totalFaltas, alunos } = turmas[turma];
            const mediaTurma = (mediaTotal / totalAlunos).toFixed(2);
            const row = tabelaResumo.insertRow();
            row.insertCell(0).innerText = turma;
            row.insertCell(1).innerText = mediaTurma;
            row.insertCell(2).innerText = totalFaltas;

            row.addEventListener('mouseover', function (event) {
                tooltipAtivo = true;
                mostrarTooltip(event, turma, alunos);
            });

            row.addEventListener('mouseout', function () {
                tooltipAtivo = false;
                setTimeout(function () {
                    if (!tooltipAtivo && !tooltipDetalheAtivo) esconderTooltip();
                }, 500);
            });
        }
    }

    function mostrarTooltip(event, turma, alunos) {
        const tabelaTooltip = document.getElementById('tooltip-tabela').getElementsByTagName('tbody')[0];
        tabelaTooltip.innerHTML = ''; // Limpa a tabela
        document.getElementById('tooltip-titulo').innerText = `Série: ${turma}`;
    
        alunos.forEach(aluno => {
            const row = tabelaTooltip.insertRow();
            row.insertCell(0).innerText = aluno.nome;
            row.insertCell(1).innerText = aluno.media.toFixed(2);
            const situacaoCell = row.insertCell(2);
            situacaoCell.innerText = aluno.situacao;
    
            // Aplica a classe de situação
            if (aluno.situacao === "Aprovado") {
                situacaoCell.className = 'status-aprovado';
            } else if (aluno.situacao === "Reprovado por faltas" || aluno.situacao === "Reprovado por nota") {
                situacaoCell.className = 'status-reprovado';
            } else if (aluno.situacao === "Recuperação") {
                situacaoCell.className = 'status-recuperacao';
            }
    
            // Adiciona os event listeners apenas uma vez
            row.cells[0].addEventListener('mouseover', function (event) {
                tooltipDetalheAtivo = true;
                mostrarTooltipDetalhe(event, aluno);
            });
    
            row.cells[0].addEventListener('mouseout', function () {
                tooltipDetalheAtivo = false;
                setTimeout(function () {
                    if (!tooltipDetalheAtivo) esconderTooltipDetalhe();
                }, 500);
            });
        });
    
        // Posiciona a tooltip no cursor
        const x = event.clientX + 10;
        const y = event.clientY + 10;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    
        // Exibe a tooltip próxima ao cursor
        tooltip.style.display = 'block';
        tooltip.style.position = 'absolute';
    
        // Filtra a tabela quando o filtro é alterado
        filtroTooltip.addEventListener('input', function () {
            filtrarTooltipTabela(alunos);
        });
    
        // Controla a exibição/ocultação da tooltip geral
        tooltip.addEventListener('mouseover', function () {
            tooltipAtivo = true;
        });
    
        tooltip.addEventListener('mouseout', function () {
            tooltipAtivo = false;
            setTimeout(function () {
                if (!tooltipAtivo && !tooltipDetalheAtivo) esconderTooltip();
            }, 1000);
        });
    }
    
    function mostrarTooltipDetalhe(event, aluno) {
        tooltipDetalhe.innerHTML = `
            <div style="padding: 10px; font-size: 16px; background-color: #fff;">
                <strong>Nome:</strong> ${aluno.nome}<br>
                <hr>
                <table style="width: 100%; text-align: left;">
                    <tr>
                        <th>Nota 1</th>
                        <th>Nota 2</th>
                        <th>Nota 3</th>
                        <th>Nota 4</th>
                    </tr>
                    <tr>
                        <td>${aluno.nota1}</td>
                        <td>${aluno.nota2}</td>
                        <td>${aluno.nota3}</td>
                        <td>${aluno.nota4}</td>
                    </tr>
                </table>
                <hr>
                <br>
                <strong>Média:</strong> ${aluno.media.toFixed(2)}<br><br>
                <strong>Situação:</strong> ${aluno.situacao}<br><br>
                <strong>Faltas:</strong> ${aluno.faltas}
            </div>
        `;
    
        const x = event.clientX + 10;
        const y = event.clientY + 10;
        tooltipDetalhe.style.left = `${x}px`;
        tooltipDetalhe.style.top = `${y}px`;
    
        // Exibe a tooltip de detalhes
        tooltipDetalhe.style.display = 'block';
        tooltipDetalhe.style.position = 'absolute';
    
        tooltipDetalhe.addEventListener('mouseover', function () {
            tooltipDetalheAtivo = true;
        });
    
        tooltipDetalhe.addEventListener('mouseout', function () {
            tooltipDetalheAtivo = false;
            setTimeout(function () {
                if (!tooltipDetalheAtivo) esconderTooltipDetalhe();
            }, 500);
        });
    }
    
    function esconderTooltipDetalhe() {
        tooltipDetalhe.style.display = 'none';
    }
    
    function esconderTooltip() {
        if (!tooltipAtivo) {
            tooltip.style.display = 'none';
        }
    }


    // Função de pesquisa de aluno
    document.getElementById('btn-pesquisar').addEventListener('click', function() {
        const nomePesquisa = document.getElementById('pesquisa-aluno').value.trim().toLowerCase();
        const alunosEncontrados = alunos.filter(aluno => aluno.nome.toLowerCase().includes(nomePesquisa));

        tabelaEditar.innerHTML = ''; // Limpar tabela de edição

        alunosEncontrados.forEach(aluno => {
            const row = tabelaEditar.insertRow();
            row.insertCell(0).innerText = aluno.nome;
            row.insertCell(1).innerText = aluno.turma;

            // Adiciona os campos para as notas e média
            row.insertCell(2).innerHTML = `<input type="number" value="${aluno.nota1}" id="nota1-${aluno.nome}">`;
            row.insertCell(3).innerHTML = `<input type="number" value="${aluno.nota2}" id="nota2-${aluno.nome}">`;
            row.insertCell(4).innerHTML = `<input type="number" value="${aluno.nota3}" id="nota3-${aluno.nome}">`;
            row.insertCell(5).innerHTML = `<input type="number" value="${aluno.nota4}" id="nota4-${aluno.nome}">`;
            row.insertCell(6).innerText = aluno.media.toFixed(2);
            row.insertCell(7).innerText = aluno.situacao;

            // Adiciona o botão de "Atualizar"
            row.insertCell(8).innerHTML = `<button class="btn-atualizar" id="btn-atualizar-${aluno.nome}">Atualizar</button>`;
            
            // Botão de atualização
            document.getElementById(`btn-atualizar-${aluno.nome}`).addEventListener('click', function() {
                atualizarNotas(aluno);
            });
        });
    });

    // Função para atualizar as notas e a situação do aluno
    function atualizarNotas(aluno) {
        const nota1 = parseFloat(document.getElementById(`nota1-${aluno.nome}`).value);
        const nota2 = parseFloat(document.getElementById(`nota2-${aluno.nome}`).value);
        const nota3 = parseFloat(document.getElementById(`nota3-${aluno.nome}`).value);
        const nota4 = parseFloat(document.getElementById(`nota4-${aluno.nome}`).value);

        aluno.nota1 = nota1;
        aluno.nota2 = nota2;
        aluno.nota3 = nota3;
        aluno.nota4 = nota4;

        // Recalcula a média e situação
        aluno.media = (nota1 + nota2 + nota3 + nota4) / 4;
        aluno.situacao = calcularSituacao(aluno.media, aluno.faltas);
        ////////////////////////////////////////////////////////////
        

        // Atualiza a célula de média na tabela de edição
        const row = Array.from(tabelaEditar.rows).find(row => row.cells[0].innerText === aluno.nome);
        if (row) {
            row.cells[6].innerText = aluno.media.toFixed(2);
            row.cells[7].innerText = aluno.situacao;
        }

        // Atualiza a média na tabela de resumo
        atualizarResumo(aluno);
        atualizarTooltip(aluno);
    }

    // Função para atualizar a média na tabela de resumo
    function atualizarResumo(alunoAlterado) {
        for (const turma in turmas) {
            const turmaData = turmas[turma];
            const alunoIndex = turmaData.alunos.findIndex(aluno => aluno.nome === alunoAlterado.nome);
            if (alunoIndex !== -1) {
                turmaData.alunos[alunoIndex] = alunoAlterado;

                // Recalcula a média total da turma
                turmaData.mediaTotal = turmaData.alunos.reduce((acc, aluno) => acc + aluno.media, 0);
                const novaMediaTurma = (turmaData.mediaTotal / turmaData.totalAlunos).toFixed(2);

                // Atualiza a média na tabela de resumo
                const linhaTurma = tabelaResumo.querySelector(`tr:nth-child(${Object.keys(turmas).indexOf(turma) + 1})`);
                linhaTurma.cells[1].innerText = novaMediaTurma;
            }
        }
    }

    function atualizarTooltip(alunoAlterado) {
        const tabelaTooltip = document.getElementById('tooltip-tabela').getElementsByTagName('tbody')[0];
        const rows = Array.from(tabelaTooltip.rows);
        rows.forEach(row => {
            if (row.cells[0].innerText === alunoAlterado.nome) {
                row.cells[1].innerText = alunoAlterado.media.toFixed(2);
                row.cells[2].innerText = alunoAlterado.situacao;

                // Aplica a classe de situação
                if (alunoAlterado.situacao === "Aprovado") {
                    row.cells[2].className = 'status-aprovado';
                } else if (alunoAlterado.situacao === "Reprovado por faltas" || alunoAlterado.situacao === "Reprovado por nota") {
                    row.cells[2].className = 'status-reprovado';
                } else if (alunoAlterado.situacao === "Recuperação") {
                    row.cells[2].className = 'status-recuperacao';
                }
            }
        });
    }

    // Carregar os dados ao inicializar
    carregarArquivoExcel();
});
