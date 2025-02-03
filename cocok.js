// const fs = require('fs');
// const pdf = require('pdf-parse');
// const v4 = require('uuid');
// import {v4 as uuidv4} from 'uuid';

function yoke(data1, data2, data1x, besar_kemiripan){
    let keseluruhan =0;
    // data1.forEach(function(value){
    let paragraf = [];
    for (let k=0;k<data1.length;k++){
        let tertinggi = 0;
        // let okp = data1[k].keys();
        // console.log(okp)
        // console.log(Object.keys(value).length)
        let simpan=0
        for(let i =0;i<data2.length;i++){
            let kesamaan = 0;
            // console.log(value.length)

            // ini jika menggunakan map hash antar kedua data
            // for (let [key, value] of data1[k]){
            //     if(data2[i].has(key)){
            //         if(value < data2[i].get(key)){
            //             kesamaan += value;
            //         }
            //         else{
            //             kesamaan += data2[i].get(key);
            //         }
            //     }
            // }

            for (let j=0;j<data1x[k].length;j++){
                if(data2[i].has(data1x[k][j])){
                    kesamaan++;
                }
            }


            if((kesamaan/data1x[k].length) > besar_kemiripan){
                // console.log((kesamaan/data1x[k].length))
                // console.log(data1x[k], data1[k])
                if(kesamaan > tertinggi){
                    tertinggi = kesamaan
                    simpan = i;
                }
            }
        }
        if(tertinggi > 0){
            paragraf.push([k+1,simpan+1, tertinggi, tertinggi/data1x[k].length])
        }
        keseluruhan+=tertinggi
        // console.log(paragraf);
    }


    //keseluruhan data yang ku punya
    let keseluruhandata1 = 0;
    for (let i =0;i<data1x.length;i++){
        keseluruhandata1+=data1x[i].length;
    }



    console.log(paragraf)
    // for (let i =0;i<paragraf.length;i++){
    //     console.log(paragraf[i]);
    // }
    console.log(keseluruhan/keseluruhandata1*100);
    // console.timeEnd('kecepatan nodejs');
    return {paragraf, keseluruhan, keseluruhandata1}
}

async function mains(data){
    console.time("kecepatan prepocessing");
    // const inputPdf = nama_file1 + '.pdf';
    // const outputTxt = nama_file1 + '.txt';
    // const outputpre = nama_file1 + ' - preprocessing.txt';

    // let iyuk = fs.readFileSync(inputPdf);
    // let kok = await pdf(iyuk);
    // let kok =  kk;
    // fs.writeFileSync(outputTxt,kok.text,{encoding: "utf8"});
    // console.log('disini kuy');


    // let data = fs.readFileSync(outputTxt, 'utf8');
    data = data.toLowerCase();
    data = data.split('\n');
    
    let proses = [];
    for (let i =0;i<data.length;i++){
        let ip = data[i].replace(/[^a-z]/g, '');
        if(ip.length > 15){
            proses.push(ip);
        }
    }
    

    let prosess = [];
    for (let i =0;i<data.length;i++){
        let ip = data[i].replace(/[^a-z]/g, '');
        let ips = data[i];
        if(ip.length > 15){
            prosess.push(ips);
        }
    }


    let oo = ''
    for (let i=0;i<prosess.length;i++){
        oo+=prosess[i]+'\n';
    }
    // let ooo = ''
    // for (let i=0;i<proses.length;i++){
    //     ooo+=proses[i]+'\n';
    // }
    // console.log(oo)
    // console.log(ooo)

    // fs.writeFileSync(outputTxt,oo,{encoding: "utf8"});
    // fs.writeFileSync(outputpre,ooo,{encoding: "utf8"});

    let deko =[];

    proses.forEach(function(item, index, arr){
        let tepe = []
        for(let i =0; i<item.length;i++){
            tepe.push(item.charCodeAt(i));
        }
        deko.push(tepe);
    })

    // console.log(deko)

    for (let i =0;i<deko.length;i++){
        // deko[i] = deko[i]*20s
        for (let j =0;j<deko[i].length-2;j++){
            deko[i][j] = (deko[i][j]*65536) + (deko[i][j+1]*256) + (deko[i][j+2]);
        }
    }

    let dekos=[]
    for(let i =0; i<deko.length;i++){
        // for(let j=0;j<deko[i].length-2;j++)
            dekos.push(deko[i].slice(0,-2));
    }


    // console.log(dekos);

    console.timeEnd("kecepatan prepocessing");
    return {dekos, oo};
    // console.log(proses)
}


function unique_hash(data){
    let lapos = []

    for(let i =0;i<data.length;i++){
        let lapo = new Map();
        for(let j=0;j<data[i].length;j++){
            if(lapo.has(data[i][j])){
                lapo.set(data[i][j], lapo.get(data[i][j])+1) ;
            }
            else lapo.set(data[i][j],1);
            
            // console.log(j);
        }
        lapos.push(lapo)
    }
    // console.log(lapos)
    return lapos;
}

async function mainsk(nama_file1, nama_file2, besar_kemiripan) {
    let data1x= await mains(nama_file1);
    let data2x = await mains(nama_file2);
    // let data1c = data1x['dekos'];
    // let data2c, pre2 = data2x;
    // data2x = await data2x;
    // console.log(data1c)
    console.time('kecepatan hashing');
    let data1 = unique_hash(data1x['dekos']);
    let data2 = unique_hash(data2x['dekos']);
    console.timeEnd('kecepatan hashing');
    // console.log(data1, data2);
    
    console.time('kecepatan pencocokan');
    data_semua=yoke(data1, data2, data1x['dekos'], besar_kemiripan);
    console.timeEnd('kecepatan pencocokan');

    let iyuk = data1x['oo'].split('\n')
    let iyuks = data2x['oo'].split('\n')
    // data1.split('\n');
    // data2.split('\n');
    return {'paragraf':data_semua['paragraf'], 'keseluruhan':data_semua['keseluruhan'], 'keseluruhandata1':data_semua['keseluruhandata1'], iyuk, iyuks};
    
}