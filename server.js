var express = require('express');
var session = require('express-session')
var bodyParser = require('body-parser');
var core_use = require('cors');
var pg = require('pg');

// Correção para análise de campos numéricos
var types = require('pg').types
types.setTypeParser(1700, 'text', parseFloat);

var app = express();

app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/front/views');
app.set('view engine', 'html');

app.use('/controllers', express.static(__dirname + '/controllers'));
app.use('/front', express.static(__dirname + '/front'));
app.use('/vendor', express.static(__dirname + '/vendor'));

app.use(session({
    secret: 'ssshhhhh',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(core_use());

var config = {
    host: "localhost",
    user: "postgres",
    database: 'CONTROLE_PEDIDOS',
    password: "1234",
    port: 5432,
    max: 30,
    idleTimeoutMills: 30000
};

// Canal de comunicação com o banco de dados
var canal = new pg.Pool(config);

app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/materias_primas', function (req, res) {
    res.render('materias_primas.html');
});

app.get('/pedidos', function (req, res) {
    res.render('pedidos.html');
});

app.get('/cadastro_pedido', function (req, res) {
    res.render('cadastro_pedido.html');
});

app.get('/materias_primas_utilizadas', function (req, res) {
    res.render('materias_primas_utilizadas.html');
});

app.get('/carregaMateriasPrimas', function (req, res) {
    console.log(canal);

    canal.connect(function (err, con, done) {
        if (err) {
            console.log(err);
        }

        var sql = '\nSELECT id_materia_prima AS id, '
                + '\n       ds_materia_prima AS descricao, '
                + '\n       custo AS custo_inicial, '
                + '\n       custo '
                + '\nFROM tb_materia_prima '
                + '\nWHERE fg_ativo = 1 '
                + '\nORDER BY ds_materia_prima;';
        console.log(sql);

        con.query(sql, function (err, ret) {

            // Libera a conexão
            done();

            if (err) {
                console.log(err);
            }

            res.send(ret.rows);
        });
    });
});

app.post('/editaMateriaPrima', function (req, res) {
    console.log(canal);

    canal.connect(function (err, con, done) {
        if (err) {
            console.log(err);
        }

        var sql = '\nUPDATE tb_materia_prima '
                + '\nSET custo = ' + req.body.custo + ' '
                + '\nWHERE id_materia_prima = ' + req.body.id + ';';
        console.log(sql);

        con.query(sql, function (err, ret) {

            // Libera a conexão
            done();

            if (err) {
                console.log(err);
            }

            res.send(ret);
        });
    });
});

app.get('/carregaProdutos', function (req, res) {
    console.log(canal);

    canal.connect(function (err, con, done) {
        if (err) {
            console.log(err);
        }

        var sql = '\nSELECT id_produto AS id, '
                + '\n       ds_produto AS descricao '
                + '\nFROM tb_produto '
                + '\nWHERE fg_ativo = 1 '
                + '\nORDER BY ds_produto;';
        console.log(sql);

        con.query(sql, function (err, ret) {

            // Libera a conexão
            done();

            if (err) {
                console.log(err);
            }

            res.send(ret.rows);
        });
    });
});

app.get('/carregaCores', function (req, res) {
    console.log(canal);

    canal.connect(function (err, con, done) {
        if (err) {
            console.log(err);
        }

        var sql = '\nSELECT id_cor AS id, '
                + '\n       ds_cor AS descricao '
                + '\nFROM tb_cor '
                + '\nWHERE fg_ativo = 1 '
                + '\nORDER BY ds_cor;';
        console.log(sql);

        con.query(sql, function (err, ret) {

            // Libera a conexão
            done();

            if (err) {
                console.log(err);
            }

            res.send(ret.rows);
        });
    });
});

app.get('/carregaPedidos', function (req, res) {
    console.log(canal);

    canal.connect(function (err, con, done) {
        if (err) {
            console.log(err);
        }

        var sql = '\nSELECT PD.id_pedido AS id, '
                + '\n       PD.quantidade, '
                + '\n       PD.dt_pedido, '
                + '\n       PD.id_produto AS produto_id, '
                + '\n       PR.ds_produto AS produto_descricao, '
                + '\n       PD.id_cor AS cor_id, '
                + '\n       CO.ds_cor AS cor_descricao '
                + '\nFROM           tb_pedido PD '
                + '\nNATURAL JOIN   tb_produto PR '
                + '\nNATURAL JOIN   tb_cor CO '
                + '\nWHERE PD.fg_ativo = 1 '
                + '\nORDER BY PD.id_pedido;';
        console.log(sql);

        con.query(sql, function (err, ret) {

            // Libera a conexão
            done();

            if (err) {
                console.log(err);
            }

            res.send(ret.rows);
        });
    });
});

app.post('/inserePedido', function (req, res) {
    console.log(canal);

    canal.connect(function (err, con, done) {
        if (err) {
            console.log(err);
        }

        var sql = '\nINSERT INTO tb_pedido (id_pedido, id_produto, id_cor, quantidade, dt_pedido, fg_ativo) '
                + '\nVALUES (default, '
                + '\n       ' + req.body.produto_id + ', '
                + '\n       ' + req.body.cor_id + ', '
                + '\n       ' + req.body.quantidade + ', '
                + '\n       \'' + req.body.dt_pedido + '\', '
                + '\n       1);';
        console.log(sql);

        con.query(sql, function (err, ret) {

            // Libera a conexão
            done();

            if (err) {
                console.log(err);
            }

            res.send(ret.rows);
        });
    });
});

app.post('/editaPedido', function (req, res) {
    console.log(canal);

    canal.connect(function (err, con, done) {
        if (err) {
            console.log(err);
        }

        var sql = '\nUPDATE tb_pedido '
                + '\nSET    id_produto = ' + req.body.produto_id + ', '
                + '\n       id_cor = ' + req.body.cor_id + ', '
                + '\n       quantidade = ' + req.body.quantidade + ', '
                + '\n       dt_pedido = \'' + req.body.dt_pedido + '\' '
                + '\nWHERE  id_pedido = ' + req.body.id + ';';
        console.log(sql);

        con.query(sql, function (err, ret) {

            // Libera a conexão
            done();

            if (err) {
                console.log(err);
            }

            res.send(ret.rows);
        });
    });
});

app.post('/deletePedido', function (req, res) {
    console.log(canal);

    canal.connect(function (err, con, done) {
        if (err) {
            console.log(err);
        }

        var sql = '\nUPDATE tb_pedido '
                + '\nSET    fg_ativo = 0 '
                + '\nWHERE  id_pedido = ' + req.body.id + ';';
        console.log(sql);

        con.query(sql, function (err, ret) {

            // Libera a conexão
            done();

            if (err) {
                console.log(err);
            }

            res.send(ret.rows);
        });
    });
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server online (Port: %s)', port);
});