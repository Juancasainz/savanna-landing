// Original release dates. Tapé Avirú also features on a Summer 2024 compilation.
// Preserve the four destinations embedded in the press kit.
export const youtubeChannel = 'https://www.youtube.com/@savanna_sound';
export type Release = {youtubeUrl?: string;title: string; label: string; collection: string; image: string; url: string; platform: string; releaseDate: string};
export const releases: Release[] = [
  {title: 'La Isla del Sol', label: 'Cafe de Anatolia', collection: 'La Isla del Sol EP', image: '/images/isla-del-sol.png', url: 'https://www.youtube.com/playlist?list=PLLMqzstogBnJCE3TJUYNzuFM8RVb3nih6', platform:'YouTube', releaseDate:'2026-01-08'},
  {title: 'Onírico', label: 'Baikal Nomads', collection: 'Badarchin Vol. 8', image: '/images/onirico.png', url: 'https://on.soundcloud.com/WWSJawO11SFalpWKQZ', platform:'SoundCloud', releaseDate:'2024-07-05'},
  {title: 'Tapé Avirú', label: '3rd Avenue', collection: 'Featured on Best of 3rd Avenue · Summer 2024', image: '/images/tape-aviru.png', url: 'https://soundcloud.com/3rdavenue/savanna-sainz-ve-tape-aviru?ref=clipboard&p=i&c=0&si=9FDCF6FAA35F4CE290B656CFC461FF95&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing', platform:'SoundCloud', releaseDate:'2023-07-27'},
  {title: 'Tibibis en el Amboró', label: '3rd Avenue', collection: 'Three of a Kind #20', image: '/images/tibibis.png', url: 'https://on.soundcloud.com/3x9EbfjefC1Wfqx7HW', platform:'SoundCloud', releaseDate:'2023-07-27'},
].sort((a,b) => b.releaseDate.localeCompare(a.releaseDate));

export const djSets = [
 {youtubeUrl:'https://www.youtube.com/watch?v=txNPXIJvJ-Y&t=8s',id:'mind',title:'The Mind',subtitle:'The Mind Series',description:'Melodic, progressive and hypnotic. A journey into focus, expansion and elevation.',genres:'Melodic · Progressive · Hypnotic',color:'#6199f0',image:'/images/sets-mind.jpg',url:'https://soundcloud.com/savanna_sound/sets/the-mind-series-by-savanna',playlistId:2113752041},
 {youtubeUrl:'https://www.youtube.com/watch?v=JZjpknted2M&t=14s',id:'body',title:'The Body',subtitle:'The Body Ritual',description:'Deep grooves, Afro house and tribal percussion. Let instinct take the lead.',genres:'Afro · Deep · Tribal',color:'#c85944',image:'/images/sets-body.jpg',url:'https://soundcloud.com/savanna_sound/sets/savanna-the-body-ritual',playlistId:2113755674},
 {youtubeUrl:'https://www.youtube.com/watch?v=WhvMir-rAQ8&t=267s',id:'soul',title:'The Soul',subtitle:'The Soul Gathering',description:'Warm, organic journeys. Slow down, find your grounding and reconnect.',genres:'Downtempo · Organic · Deep',color:'#d1a2e2',image:'/images/sets-soul.jpg',url:'https://soundcloud.com/savanna_sound/sets/savanna-the-soul-gathering',playlistId:2113755563},
];
