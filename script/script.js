document.addEventListener('DOMContentLoaded', function() {
    // Navegação entre seções
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all nav items
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the corresponding content section
            const target = this.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // Dados de exemplo
    let clientes = [
        { id: 1, nome: "João Silva", email: "joao@exemplo.com", telefone: "(11) 9999-9999" }
    ];

    let produtos = [
        { id: 1, nome: "Notebook Dell", preco: 3499.90, estoque: 15 }
    ];

    let vendas = [];
    let financeiro = [
        { data: "10/05/2023", descricao: "Venda #001", valor: 3499.90, tipo: "Receita", status: "Pago" },
        { data: "05/05/2023", descricao: "Compra de estoque", valor: 1200.00, tipo: "Despesa", status: "Pago" }
    ];

    // Itens da venda atual
    let vendaAtual = {
        clienteId: null,
        itens: [],
        total: 0
    };

    // Funções auxiliares
    function formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }

    // Clientes
    const clienteForm = document.getElementById('cliente-form');
    const clientesTable = document.getElementById('clientes-table').querySelector('tbody');

    function renderClientes() {
        clientesTable.innerHTML = '';
        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.email}</td>
                <td>${cliente.telefone}</td>
                <td class="actions">
                    <button class="editar-cliente" data-id="${cliente.id}">Editar</button>
                    <button class="danger excluir-cliente" data-id="${cliente.id}">Excluir</button>
                </td>
            `;
            clientesTable.appendChild(tr);
        });

        // Atualizar select de clientes no formulário de vendas
        const clienteSelect = document.getElementById('venda-cliente');
        clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nome;
            clienteSelect.appendChild(option);
        });
    }

    clienteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const novoCliente = {
            id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
            nome: document.getElementById('cliente-nome').value,
            email: document.getElementById('cliente-email').value,
            telefone: document.getElementById('cliente-telefone').value
        };

        clientes.push(novoCliente);
        renderClientes();
        clienteForm.reset();
    });

    // Produtos
    const produtoForm = document.getElementById('produto-form');
    const produtosTable = document.getElementById('produtos-table').querySelector('tbody');

    function renderProdutos() {
        produtosTable.innerHTML = '';
        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produto.id}</td>
                <td>${produto.nome}</td>
                <td>${formatarMoeda(produto.preco)}</td>
                <td>${produto.estoque}</td>
                <td class="actions">
                    <button class="editar-produto" data-id="${produto.id}">Editar</button>
                    <button class="danger excluir-produto" data-id="${produto.id}">Excluir</button>
                </td>
            `;
            produtosTable.appendChild(tr);
        });

        // Atualizar select de produtos no formulário de vendas
        const produtoSelect = document.getElementById('venda-produto');
        produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = `${produto.nome} - ${formatarMoeda(produto.preco)}`;
            produtoSelect.appendChild(option);
        });
    }

    produtoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const novoProduto = {
            id: produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1,
            nome: document.getElementById('produto-nome').value,
            preco: parseFloat(document.getElementById('produto-preco').value),
            estoque: parseInt(document.getElementById('produto-estoque').value)
        };

        produtos.push(novoProduto);
        renderProdutos();
        produtoForm.reset();
    });

    // Vendas
    const vendaForm = document.getElementById('venda-form');
    const addProdutoBtn = document.getElementById('add-produto');
    const vendasTable = document.getElementById('vendas-table').querySelector('tbody');
    const vendaTotalElement = document.getElementById('venda-total');
    const finalizarVendaBtn = document.getElementById('finalizar-venda');

    function renderVendaAtual() {
        vendasTable.innerHTML = '';
        vendaAtual.total = 0;

        vendaAtual.itens.forEach(item => {
            const produto = produtos.find(p => p.id === item.produtoId);
            const subtotal = produto.preco * item.quantidade;
            vendaAtual.total += subtotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${item.quantidade}</td>
                <td>${formatarMoeda(produto.preco)}</td>
                <td>${formatarMoeda(subtotal)}</td>
                <td class="actions">
                    <button class="danger remover-item" data-produto-id="${produto.id}">Remover</button>
                </td>
            `;
            vendasTable.appendChild(tr);
        });

        vendaTotalElement.textContent = formatarMoeda(vendaAtual.total);
    }

    addProdutoBtn.addEventListener('click', function() {
        const clienteId = parseInt(document.getElementById('venda-cliente').value);
        const produtoId = parseInt(document.getElementById('venda-produto').value);
        const quantidade = parseInt(document.getElementById('venda-quantidade').value);

        if (!clienteId || !produtoId || !quantidade) {
            alert('Preencha todos os campos!');
            return;
        }

        // Verificar se já existe o produto na venda
        const itemExistente = vendaAtual.itens.find(item => item.produtoId === produtoId);
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            vendaAtual.itens.push({
                produtoId,
                quantidade
            });
        }

        vendaAtual.clienteId = clienteId;
        renderVendaAtual();
        document.getElementById('venda-produto').value = '';
        document.getElementById('venda-quantidade').value = 1;
    });

    // Financeiro
    const financeiroTable = document.getElementById('financeiro-table').querySelector('tbody');

    function renderFinanceiro() {
        financeiroTable.innerHTML = '';
        financeiro.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.data}</td>
                <td>${item.descricao}</td>
                <td>${formatarMoeda(item.valor)}</td>
                <td>${item.tipo}</td>
                <td>${item.status}</td>
            `;
            financeiroTable.appendChild(tr);
        });
    }

    // Finalizar venda
    finalizarVendaBtn.addEventListener('click', function() {
        if (vendaAtual.itens.length === 0) {
            alert('Adicione produtos à venda!');
            return;
        }

        const novaVenda = {
            id: vendas.length > 0 ? Math.max(...vendas.map(v => v.id)) + 1 : 1,
            clienteId: vendaAtual.clienteId,
            itens: [...vendaAtual.itens],
            total: vendaAtual.total,
            data: new Date().toLocaleDateString('pt-BR')
        };

        vendas.push(novaVenda);

        // Adicionar ao financeiro
        financeiro.push({
            data: novaVenda.data,
            descricao: `Venda #${novaVenda.id}`,
            valor: novaVenda.total,
            tipo: "Receita",
            status: "Pago"
        });

        // Atualizar estoque
        novaVenda.itens.forEach(item => {
            const produto = produtos.find(p => p.id === item.produtoId);
            if (produto) {
                produto.estoque -= item.quantidade;
            }
        });

        // Limpar venda atual
        vendaAtual = {
            clienteId: null,
            itens: [],
            total: 0
        };

        // Resetar formulário
        vendaForm.reset();
        renderVendaAtual();
        renderProdutos();
        renderFinanceiro();

        alert('Venda finalizada com sucesso!');
    });

    // Inicialização
    renderClientes();
    renderProdutos();
    renderVendaAtual();
    renderFinanceiro();
});