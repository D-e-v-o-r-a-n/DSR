import React from "react";
import '../../App.scss'

export default function TrackSearchResult({track, trackFunction}){

    return(
        <div className="SearchResult" onClick={()=>{trackFunction(track.id)}}>
            <img src={track.albumUrl} />
            <div className="text">
                <div className="title">{track.title}</div>
                <div>{track.artist}</div>
            </div>
        </div>
    )
}