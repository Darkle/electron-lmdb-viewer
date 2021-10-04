The clipboard api is available in the renderer, so dont need to use preload script for that: https://www.electronjs.org/docs

To work with binary data, you could put it into a map. Uint8Array's can be used as a Map key or value. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
So I could just clear, then update the map on load of new db and when the user copies/edits that value,, but would need to get index as has to be done from td cell, so need to get via index, so maybe could loop over like this and keep an index manually in the loop (start index at one as we start rows at 1) https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#iterating_map_with_for..of

Will i need to convert things to messagepack/cbor etc when edit/add??
When add mention the current encoding (messagepack/cbor etc).
