const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
var sqlite3 = require("sqlite3");

const app = express();

const port = 6789;

const fs = require('fs');
const { PassThrough } = require('stream');
const session = require('express-session'); 

let listaIntrebari;
fs.readFile('intrebari.json', (err, data) => {
	if (err)
	{
		throw err;
	}
	listaIntrebari = JSON.parse(data);
	
});

const db = new sqlite3.Database('./cumparaturi.db', (err) => {
	if (err) {
	  console.log("Error Occured - ${err.message}");
	} else {
	  console.log("DataBase Connected");
	}
});

app.use(express.static('css'))

app.use(cookieParser())

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');

// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);

// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static(__dirname + '/public'));

// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());

// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'secret-key'
}))

// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.get('/', (req, res) => {
	let utilizator = req.session.user
	let mesaj = ''
	if(typeof utilizator !== 'undefined')
	{
		mesaj = "Bine ai venit " + utilizator + "!"
		utilizator = "Logat ca " + utilizator
	}
	res.render('index', {utilizator: utilizator, mesaj: mesaj})
});

app.get('/chestionar', (req, res) => {
	// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
	// chestionar: fisierul
	// intrebari: numele variabilei din fisierul ejs
	// listaIntrebari: valoarea asignata variabilei
	res.render('chestionar', {intrebari: listaIntrebari});
});

app.get('/autentificare', (req, res) => {
	let mesaj = req.session.mesajEroare
	if(typeof mesaj == 'undefined')
	{
		mesaj = ''
	}
	res.render('autentificare', {mesaj: mesaj})
});

app.post('/autentificare', (req, res) => {
	res.render('autentificare', {})
});

app.post('/verificare-autentificare', (req, res) => {
	//console.log("/verificare-autentificare body: \n" + JSON.stringify(req.body))
	let uname = req.body["uname"]
	if(req.body["uname"] == "admin" && req.body["psw"] == "admin") {
		console.log("LOGAT SUCC: pass and user same")
		//res.send('layout', {utilizator: sessionVar.userid})
		//res.status('layout').send({utilizator: sessionVar.userid})
		//req.session("utilizator", req.body["uname"])
		//res.cookie('utilizator', {uname: req.body["uname"], psw: req.body["psw"]})
		//res.redirect('/', {utilizator: req.cookies.utilizator.uname})
		req.session.user = req.body["uname"]
		res.redirect('/')
	}
	else{
		console.log("LOGAT ERR: pass and user different " + req.body["psw"])
		//res.cookie('mesajEroare', {err: 'Numele de utilizator sau parola sunt incorecte!'})
		//res.redirect('/autentificare')
		req.session.mesajEroare = "Numele de utilizator sau parola sunt incorecte!"
		//res.redirect('/autentificare', {eroare: req.cookies.mesajEroare.err})
		res.redirect('/autentificare')
	}
	
});

app.get('/logout', (req,res) => {
    req.session.destroy();
	console.log("DEZLOGAT");
    res.redirect('/');
});

app.post('/rezultat-chestionar', (req, res) => {
	let rezultat = []
	let suma = 0;
	//extrag cheile din obiect si le pun intr-un vector peste care fac map
	Object.keys(req.body).forEach((el,index)=>{
		let rasp = {}
		let intrebare = listaIntrebari[Number(el)]["intrebare"]
		let raspCorect = Number( listaIntrebari[Number(el)].corect )
		let raspDat = Number(req.body[el])

		rasp["intrebare"] = intrebare
		if(raspCorect == raspDat)
		{
			rasp["rezultat"] = "corect"
			suma +=1;
		}
		else 
		{
			rasp["rezultat"] = "greșit"
			
		}
		rezultat.push(rasp)
	})

	res.render('rezultat-chestionar', {
		rezultate: rezultat,
		suma: suma
	})
});


app.get('/creare-bd', async (req, res) =>{
	let query = "CREATE TABLE produse(id_produs, nume_produs, pret)"
	let creare = await db.exec(query, (err, val) => {});
	res.redirect('/');
});

app.get('/populare', async (req, res) =>{
	let aux = [{
		nume: "Ana",
		pret: 5
	},
	{
		nume: "Hartie",
		pret: 6
	}]
	aux.forEach( (el) => {
		console.log(el);
		let query = "INSERT INTO produse()"
		db.exec(query, (err, val) => {})
	})
});
app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));