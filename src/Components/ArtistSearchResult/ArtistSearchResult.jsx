import React from "react";
import '../../App.scss'

export default function ArtistSearchResult({artist, artistFunction}){

    return(
        <div className="SearchResult" onClick={()=>{artistFunction(artist.id)}}>
            <img src={artist.imageUrl} />
            <div className="text">
                <div className="title">{artist.name}</div>
            </div>
        </div>
    )
}