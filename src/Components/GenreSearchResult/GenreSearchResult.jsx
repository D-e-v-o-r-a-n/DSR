import React from "react";
import '../../App.scss'

export default function GenreSearchResult({genre}){

    return(

        <option value={genre}>{genre}</option>
    )
}