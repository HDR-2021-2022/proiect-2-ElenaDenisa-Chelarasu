const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')

const app = express();

const port = 6789;

const fs = require('fs');
let listaIntrebari;
fs.readFile('intrebari.json', (err, data) => {
	if (err)
	{
		throw err;
	}
	listaIntrebari = JSON.parse(data);
	
});

app.use(express.static('css'))

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.get('/', (req, res) => res.send('Hello World'));

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
	/*
	let listaIntrebari = [
		{
			intrebare: 'Care este cel mai folosit tip de pagina?',
			variante: ["A4", "A10", "Z16", "A5"],
			corect: 1
		},
		{
			intrebare: 'Care tip de copertă este mai durabil?',
			variante: ["Cartonată", "Importată", "Broșată", "Oțelită"],
			corect: 1
		},
		{
			intrebare: 'Alegeți care dintre staționarele următoare NU există: ',
			variante: ["Ierbar", "Perforator", "Cârlingă", "Ground"],
			corect: 3
		}
	];
	*/
	
	
	// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
	// chestionar: fisierul
	// intrebari: numele variabilei din fisierul ejs
	// listaIntrebari: valoarea asignata variabilei
	res.render('chestionar', {intrebari: listaIntrebari});
});

app.post('/rezultat-chestionar', (req, res) => {
	
	console.log("rez:",listaIntrebari)

	let rezultat = []
	let suma = 0;
	//extrag cheile din obiect si le pun intr-un vector peste care fac map
	Object.keys(req.body).forEach((el,index)=>{
		console.log("el",el)
		let rasp = {}
		let intrebare = listaIntrebari[Number(el)]["intrebare"]
		let raspCorect = Number( listaIntrebari[Number(el)].corect );
		let raspDat = Number(req.body[el])

		rasp["intrebare"] = intrebare;
		if(raspCorect == raspDat)
		{
			rasp["rezultat"] = "corect"
			suma +=1
		}
		else 
		{
			rasp["rezultat"] = "greșit"
			
		}
		rezultat.push(rasp)
	})
	let nr=0;

	res.render('rezultat-chestionar', {
		rezultate: rezultat,
		suma: suma
	})
});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));