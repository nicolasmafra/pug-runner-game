var express = require('express'); // Flamework do Servidor
var path = require('path'); // Módulo para manipular caminhos

var app = express(); // Variável do express
var port = process.env.PORT || 3000; // Porta do servidor

// Mandando o Express rodar estaticamente a pasta de conteúdo
app.use(express.static('site')); 

// Rodando o servidor na determinada porta
app.listen(port);
