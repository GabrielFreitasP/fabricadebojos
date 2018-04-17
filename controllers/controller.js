var app = angular.module('App', ['rw.moneymask', 'ngCookies']);

app.controller('MateriasPrimas', function ($scope, $http) {

	$scope.voltar = function () {
		window.location.href = '/';
	}

	$scope.carregaTabela = function () {
		$http.get('/carregaMateriasPrimas/').then(function (res) {
			$scope.materiasPrimas = res.data;
		});
	}

	$scope.salvar = function (materiaPrima) {
		$http.post('/editaMateriaPrima/', materiaPrima).then(function (res) {
			materiaPrima.custo_inicial = materiaPrima.custo;
			alert('Custo editado!')
		});
	}

});

app.controller('Pedidos', function ($scope, $http, $cookies) {

	$scope.voltarHome = function () {
		window.location.href = '/';
	}

	$scope.voltar = function () {
		window.location.href = '/pedidos';
	}

	$scope.novoCadastro = function () {
		$cookies.putObject('pedido', undefined);
		
		window.location.href = '/cadastro_pedido';
	}

	$scope.materiasPrimas = function () {
		$cookies.putObject('pedidos', $scope.pedidos);

		window.location.href = '/materias_primas_utilizadas';
	}

	$scope.carregaTabela = function () {
		$http.get('/carregaPedidos/').then(function (res) {
			$scope.pedidos = res.data;
		});
	}

	$scope.init = function () {
		$scope.pedido = $cookies.getObject('pedido');
		//$cookies.putObject('pedido', undefined);

		if (angular.isUndefined($scope.pedido)) {
			$scope.min_data = new Date();

			$scope.pedido = {};

			$scope.pedido.id = 0;

			$scope.pedido.dt_pedido = $scope.min_data;

			$http.get('/carregaProdutos/').then(function (res) {
				$scope.produtos = res.data;
				if ($scope.produtos.length > 0) {
					$scope.pedido.produto_id = $scope.produtos[0].id;
				}
			});

			$http.get('/carregaCores/').then(function (res) {
				$scope.cores = res.data;
				if ($scope.cores.length > 0) {
					$scope.pedido.cor_id = $scope.cores[0].id;
				}
			});
		} else {
			$scope.pedido.dt_pedido = new Date($scope.pedido.dt_pedido);
			$scope.min_data = new Date('01/01/2000');

			$http.get('/carregaProdutos/').then(function (res) {
				$scope.produtos = res.data;
			});

			$http.get('/carregaCores/').then(function (res) {
				$scope.cores = res.data;

			});
		}

		$scope.disabled = $scope.pedido < new Date();
	}

	$scope.salvar = function () {
		if ($scope.form.$invalid) {
			return;
		}

		if ($scope.pedido.id == 0) {
			$http.post('/inserePedido/', $scope.pedido).then(function (res) {
				alert('Pedido cadastrado!');
				window.location.href = '/pedidos';
			});
		} else {
			$http.post('/editaPedido/', $scope.pedido).then(function (res) {
				alert('Pedido editado!');
				window.location.href = '/pedidos';
			});
		}
	}

	$scope.editar = function (pedido) {
		$cookies.putObject('pedido', pedido);
		window.location.href = '/cadastro_pedido';
	}

	$scope.remover = function (pedido) {
		var deletar = confirm('Deseja deletar o pedido ' + pedido.id + '?');
		if (deletar) {
			$http.post('/deletePedido/', pedido).then(function (res) {
				$scope.carregaTabela();
				alert('Pedido deletado!');
			});
		}
	}

});

app.controller('MateriasPrimasUtilizadas', function ($scope, $http, $cookies) {

	var espuma_por_placas = 1.2;
	var tecido_por_placas = 0.4;

	$scope.voltar = function () {
		window.location.href = '/pedidos';
	}

	$scope.init = function () {
		var pedidos = $cookies.getObject('pedidos');
		//$cookies.putObject('pedidos', undefined);

		var materiasPrimas = [];

		$http.get('/carregaMateriasPrimas/').then(function (res) {
			materiasPrimas = res.data;

			var vlrEspuma = materiasPrimas[0].custo;
			var vlrTecido = materiasPrimas[1].custo;			

			var qtdAzul = 0;
			var qtdRosa = 0;
			var qtdVermelho = 0;

			var qtdEspuma = 0;

			var qtdTotal = 0;

			for (var i = 0; i < pedidos.length; i++) {
				var pedido = pedidos[i];

				qtdTotal+= pedido.quantidade;

				var qtdComPerdas = pedido.quantidade * 1.1;

				var qtdPlacas = Math.round(qtdComPerdas / 8);

				var qtdProduzir = qtdPlacas * tecido_por_placas;

				qtdEspuma += (qtdPlacas * espuma_por_placas);

				switch (pedido.cor_descricao) {
					case 'Azul':
						qtdAzul += qtdProduzir;
						break;
					case 'Rosa':
						qtdRosa += qtdProduzir;
						break;
					case 'Vermelho':
						qtdVermelho += qtdProduzir;
						break;
				}
			}

			if (qtdEspuma > 0) {
				$scope.materiasPrimasUtilizadas = [{
					descricao: 'Espuma',
					cor: '-',
					quantidade: parseFloat(qtdEspuma.toFixed(3)).toString().replace(".", ","),
					valor: qtdEspuma * vlrEspuma
				}];
			}

			if (qtdAzul > 0) {
				$scope.materiasPrimasUtilizadas.push({
					descricao: 'Tecido',
					cor: 'Azul',
					quantidade: parseFloat(qtdAzul.toFixed(3)).toString().replace(".", ","),
					valor: qtdAzul * vlrTecido
				});
			}

			if (qtdRosa > 0) {
				$scope.materiasPrimasUtilizadas.push({
					descricao: 'Tecido',
					cor: 'Rosa',
					quantidade: parseFloat(qtdRosa.toFixed(3)).toString().replace(".", ","),
					valor: qtdRosa * vlrTecido
				});
			}

			if (qtdVermelho > 0) {
				$scope.materiasPrimasUtilizadas.push({
					descricao: 'Tecido',
					cor: 'Vermelho',
					quantidade: parseFloat(qtdVermelho.toFixed(3)).toString().replace(".", ","),
					valor: qtdVermelho * vlrTecido
				});
			}

			$scope.totalMateriaPrima = (qtdEspuma * vlrEspuma) + (qtdAzul * vlrTecido) + (qtdRosa * vlrTecido) + (qtdVermelho * vlrTecido);
			$scope.verbaMarketing = $scope.totalMateriaPrima * 0.1;
			$scope.maoDeObra = $scope.totalMateriaPrima * 0.3;

			$scope.total = $scope.totalMateriaPrima * 1.4;
			$scope.custoPorProduto = qtdTotal == 0 ? 0 : $scope.total / qtdTotal;
		});
	}

});