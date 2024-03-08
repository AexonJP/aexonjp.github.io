
async function getApiTopAiring(){
    const response = await fetch("https://api.jikan.moe/v4/top/anime?filter=airing");
    const api_anime = await response.json();
    // console.log(api_anime);
    const ik = [];
    const nama = [];
    const score =[];
    for(let i =0;i<10;i++){
        ik.push(api_anime['data'][i].images.webp.large_image_url);
        nama.push(api_anime['data'][i]["titles"][0].title);
        score.push(api_anime['data'][i]["score"]);
    }
    let ke="";
    for(let i =0;i<10;i++){
        ke = ke.concat(" ", "<li><img onclick=\"location.href='#Airing"+i+"'\"   src=\""+ik[i]+"\" alt=\"\"><div>"+nama[i]+"</div><a>★ "+score[i]+"</a></li>");
    }
    document.getElementById("top_anime_ongoing").innerHTML = ke;
    // console.log(ke);
    // console.log(api_anime['data'][0].images.jpg.small_large_image_url);
}

async function getApiTop(){
    const response = await fetch("https://api.jikan.moe/v4/top/anime");
    const api_anime = await response.json();
    // console.log(api_anime);
    const ik = [];
    const nama = [];
    const score =[];
    for(let i =0;i<10;i++){
        ik.push(api_anime['data'][i].images.webp.large_image_url);
        nama.push(api_anime['data'][i]["titles"][0].title);
        score.push(api_anime['data'][i]["score"]);
    }
    let ke="";
    for(let i =0;i<10;i++){
        ke = ke.concat(" ", "<li><img onclick=\"location.href='#Top"+i+"'\"  src=\""+ik[i]+"\" alt=\"\"><div>"+nama[i]+"</div><a>★ "+score[i]+"</a></li>");
    }
    document.getElementById("top_anime").innerHTML = ke;
    // console.log(ke);
}