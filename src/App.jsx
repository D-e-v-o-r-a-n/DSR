import logo from './logo.svg';
import './App.scss';
import React, {useState, useEffect, useRef} from 'react';
import { loginUrl, getTokenFromUrl } from './spotify';
import SpotifyWebApi from 'spotify-web-api-js'
import ArtistSearchResult from './Components/ArtistSearchResult/ArtistSearchResult';
import GenreSearchResult from './Components/GenreSearchResult/GenreSearchResult';
import TrackSearchResult from './Components/TracksSearchResult/TrackSearchResult';
import genres from './genres';
import ResultPlaylist from './Components/ResultPlaylist/ResultPlaylist';

const spotify = new SpotifyWebApi()

function App() {
  const [spotifyToken, setSpotifyToken] = useState("");

  const [artistQuery, setArtistQuery] = useState()
  const [trackQuery, setTrackQuery] = useState()

  const [artistSearchResultArray, setArtistSearchResultArray] = useState([])
  const [trackSearchResultArray, setTrackSearchResultArray] = useState([])
 
  const [referenceArtists, setReferenceArtists] = useState([])
  const [referenceGenres, setReferenceGenres] = useState([])
  const [referenceTracks, setReferenceTracks] = useState([])

  const [artistFeedback, setArtistFeedback] = useState('placeholder')
  const [genreFeedback, setGenreFeedback] = useState('placeholder')
  const [trackFeedback, setTrackFeedback] = useState('placeholder')

  const artistFeedback_ref = useRef(null)
  const genreFeedback_ref = useRef(null)
  const trackFeedback_ref = useRef(null)

  const [createdPlaylist,setCreatedPlaylist] = useState(false)

  const [recomendationsPlaylist, setRecomendationsPlaylist] = useState([])

  const buttonStyle = useRef()

  const genre_ref = useRef(null)
  const artist_ref = useRef(null)
  const tracks_ref = useRef(null)
  
  const recButton = useRef(null)

  const user_id = useRef()
  const playlist_id = useRef()

  const ARTISTID = useRef()

  // this gets me a access token
  useEffect(() => {
    const _spotifyToken = getTokenFromUrl().access_token;

    window.location.hash = ""

    if (_spotifyToken){
      setSpotifyToken(_spotifyToken)

      spotify.setAccessToken(_spotifyToken)

      spotify.getMe()
      .then(function(data) {
        console.log('User id', data.id);
        user_id.current = data.id
      }, function(err) {
        console.error(err);
      });
    }
  }, [])


  // this is the search for tracks request
  useEffect(()=>{
    if(!trackQuery) return setTrackSearchResultArray([])
    if(!spotifyToken) return

    spotify.searchTracks(trackQuery, {limit: 3}).then(res =>{
      setTrackSearchResultArray(res.tracks.items.map(track=>{
        const smallestAlbumImage = track.album.images.reduce((
          smallest, image) => {
            if(image.height < smallest.height) return image
            return smallest
          }, track.album.images[0])
          
        return{
          artist: track.artists[0].name,
          title: track.name,
          id: track.id,
          albumUrl: smallestAlbumImage.url
        }
      }))
    }).catch(err=>console.log(err))
  }, [trackQuery, spotifyToken])

  // this is the search for artist request
  useEffect(()=>{
      if(!artistQuery) return setArtistSearchResultArray([])
      if(!spotifyToken) return
  
      ARTISTID.current = undefined
      
      spotify.searchArtists(artistQuery, {limit: 3}).then(res =>{
        setArtistSearchResultArray(
          res.artists.items.map(artist=>{
          const smallestImage = artist.images.reduce((
            smallest, image) => {
              if(image.height < smallest.height) return image
              return smallest
            }, artist.images[0])
          return{
            name: artist.name,
            id: artist.id,
            imageUrl: smallestImage.url
          }
        })
      )  
      }).catch(err=>console.log(err))
    }
  , [artistQuery, spotifyToken])


    // useEffect(()=>{
    //   if (createdPlaylist)console.log(recomendationsPlaylist, 'useEffect')
    // },[createdPlaylist])








  function submitArtist(id){
    if(artist_ref.current != undefined) artist_ref.current.value = ''
    setReferenceArtists(referenceArtists => [...referenceArtists, id])
    artistFeedback_ref.current.style.visibility = 'visible'
    setArtistFeedback("Artist included")
    artistFeedback_ref.current.style.color = 'lime'
    setTimeout(()=>{
      artistFeedback_ref.current.style.visibility = 'hidden'
    },2000)

  }
  function submitGenre(genre){
    setReferenceGenres(referenceGenres => [...referenceGenres, genre])
    genreFeedback_ref.current.style.visibility = 'visible'
    setGenreFeedback("Genre included")
    genreFeedback_ref.current.style.color = 'lime'
    setTimeout(()=>{
      genreFeedback_ref.current.style.visibility = 'hidden'
    },2000)
  } 
  function submitTrack(track){
    if(tracks_ref.current != undefined) tracks_ref.current.value = ''
    setReferenceTracks(referenceTracks => [...referenceTracks, track])
    trackFeedback_ref.current.style.visibility = 'visible'
    setTrackFeedback("Track included")
    trackFeedback_ref.current.style.color = 'lime'
    setTimeout(()=>{
      trackFeedback_ref.current.style.visibility = 'hidden'
    },2000)

  } 

  async function recommendFunction(number=20){
    let seedArtists = referenceArtists;
    let seedGenres = referenceGenres;
    let seedTracks = referenceTracks;
    await spotify.getRecommendations({seed_artists: seedArtists,seed_genres: seedGenres, seed_tracks: seedTracks})
    .then(function(data) {
      setRecomendationsPlaylist(
        data.tracks.map(track=>{
          const smallestImage = track.album.images.reduce((
            smallest, image) => {
              if(image.height < smallest.height) return image
              return smallest
            }, track.album.images[0])
          return{
            name: track.name,
            artist: track.artists[0].name,
            uri: track.uri,
            imageUrl: smallestImage.url
          }
        })
      )
    }, function(err) {
      console.error(err); // https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA
    });
    setCreatedPlaylist(true)
  }

  async function savePlaylist(){
    await spotify.createPlaylist(user_id.current,{name: 'Your recommendations playlist'})
    .then(data => playlist_id.current = data.id)
    .catch(err => console.log(err))

    let recommendedUris = [recomendationsPlaylist.map(track => {return track.uri})]
    recommendedUris = recommendedUris[0]
    spotify.addTracksToPlaylist(playlist_id.current,recommendedUris)
  }

  function rerollPlaylist(){
    recommendFunction()
  }

  async function rerollTrack(returnedValue){
    let swappedSong;
     setRecomendationsPlaylist(current =>
      current.filter(track => {
        return track !== returnedValue;
      }))
    await spotify.getRecommendations({seed_artists: referenceArtists,seed_genres: referenceGenres, seed_tracks: referenceTracks, limit: 1,})
    .then(function(data) {
      swappedSong = (
        data.tracks.map(track=>{
          const smallestImage = track.album.images.reduce((
            smallest, image) => {
              if(image.height < smallest.height) return image
              return smallest
            }, track.album.images[0])
          return{
            name: track.name,
            artist: track.artists[0].name,
            uri: track.uri,
            imageUrl: smallestImage.url
          }
        })
      )
      setRecomendationsPlaylist(recomendationsPlaylist => [...recomendationsPlaylist, swappedSong[0]])    
    }, function(err) {
      console.error(err); // https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA
    });
    }

  function reset(){
    setReferenceArtists([])
    setReferenceGenres([])
    setReferenceTracks([])
    setCreatedPlaylist(false)
  }
  return (
    <div className="App">
      <header className="App-header">
        {spotifyToken ? 
          <div className='References' style={createdPlaylist ? { display: 'none' } : {}}>
            <h1>References</h1>
            <div className='params'>
              <div className='artists'>
                <span>Artists</span>  {/* 7CJgLPEqiIRuneZSolpawQ*/}
                <span ref={artistFeedback_ref} style={{visibility: 'hidden'}}>{artistFeedback}</span>
                <div>
                  <input type="text" ref={artist_ref} onChange={event => setArtistQuery(event.target.value)} placeholder='Select reference artist'/>
                </div>
                {artistSearchResultArray.map((artist) => (
                  <ArtistSearchResult artist={artist} artistFunction={submitArtist} />
                ))}
              </div>

              <div className='genres'>
                <span>Genres</span>
                <span ref={genreFeedback_ref} style={{visibility: 'hidden'}}>{genreFeedback}</span>
                <div>
                  <select name="" id="" ref={genre_ref}>
                    <option disabled selected value> -- select an option -- </option>
                    {genres.map((genre) => (
                      <GenreSearchResult genre={genre} />

                    ))}
                  </select>
                  <button onClick={event => submitGenre(genre_ref.current.value)}>Submit Genre</button>
                </div>
              </div>

              <div className='tracks'>
                <span>Tracks</span>
                <span ref={trackFeedback_ref} style={{visibility: 'hidden'}}>{trackFeedback}</span>
                <div>
                  <input type="text" ref={tracks_ref} onChange={event => setTrackQuery(event.target.value)} placeholder='Select reference track'/>
                </div>
                {trackSearchResultArray.map((track) => (
                  <TrackSearchResult track={track} trackFunction={submitTrack} />
                ))}
              </div>
            </div>

            <span style={{ display: 'none' }}>
              {referenceArtists.length == 0 || referenceGenres.length == 0 || referenceTracks.length == 0 ? buttonStyle.current = 'recommendButtonDisabled' : buttonStyle.current = 'recommendButton'}
            </span>
            <button id={buttonStyle.current} ref={recButton} onClick={recommendFunction} disabled={referenceArtists.length == 0 || referenceGenres.length == 0 || referenceTracks.length == 0}>Generate recommendations</button>
          </div>
                                                                                                                      
        : <a href={loginUrl} id='signInId' style={spotifyToken ? {display: 'none'} : {}} >Sign in with Spotify</a>
      }
      {createdPlaylist ?
      <div style={{margin: '1rem'}}>
        <div className='resultPlaylist'>
          {recomendationsPlaylist.map(track=>(
            <ResultPlaylist  track={track} reroll={rerollTrack}/>
          ))}
        </div>
        <button
        onClick={() => {
          savePlaylist();
          alert("Playlist saved on your profile");
        }}>Save this playlist</button>
        <button onClick={rerollPlaylist}>Try again</button>
        <button onClick={reset}>Change references</button>
      </div>
      : null }
      </header>
    </div>
  );
}

export default App;
