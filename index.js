var express = require('express'); // Flamework do Servidor
var app     = express(); // Váriavel do express
var http    = require('http').Server(app); // Servidor em si
var path    = require('path'); // Módulo para manipular caminhos
var port    = process.env.PORT || 3000; // Porta do servidor

// Mandando o Express rodar estáticamente a pasta client
app.use(express.static(path.join(__dirname, 'src'))); 


// Na rota principal, a página é carregada 
app.get('/', function(req, res){
  res.sendFile('/client/index.html', {root:'.'});
});

// Rodando o servidor na determinada porta
http.listen(port);
