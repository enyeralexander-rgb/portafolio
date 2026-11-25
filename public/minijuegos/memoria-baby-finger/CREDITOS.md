# Créditos y licencias de la maqueta de las Memorias

Recursos de `docs/maquetas/memoria/` (sprint B2, 2026-11-06). Al pasar a la APK se copian a `CREDITS.md` del proyecto.

## Fuentes

| Archivo | Origen | Licencia |
|---|---|---|
| `fuentes/Fredoka-Bold.ttf`, `fuentes/Fredoka-SemiBold.ttf` y `fuentes/OFL-Fredoka.txt` | Copias sin cambios de `docs/maquetas/sopa-de-letras/fuentes/` (origen y SHA-256 en el `CREDITOS.md` de la sopa: repositorio del autor hafontia-zz/Fredoka-One, commit `35c584ff`) | SIL Open Font License 1.1 |

## Sonidos y música

| Archivo | Origen | Licencia |
|---|---|---|
| `sonidos/musica-fondo.mp3` | Copia sin cambios de la sopa: «Happy Clappy Loop» de OwlishMedia, https://opengameart.org/content/happy-clappy-loop (tratamiento descrito en el `CREDITOS.md` de la sopa). Suena en el parque | CC0, según la ficha de OpenGameArt (verificada en B1) |
| `sonidos/musica-mar.mp3` | El mismo `musica-fondo.mp3` con dos filtros de agudos a 1300 Hz y +2,5 dB (ffmpeg, MP3 mono de 80 kbps): la misma canción oída «bajo el agua». Suena en el mar | CC0 (obra derivada de la anterior) |
| `sonidos/victoria.mp3` | Copia sin cambios de la sopa: `jingles_SAX10.ogg` de «Music Jingles» de Kenney | CC0 1.0 |
| `sonidos/voltear.mp3` | `card-slide-1.ogg` de Casino Audio 1.1 de Kenney (Kenney Vleugels, www.kenney.nl) | CC0 1.0 |
| `sonidos/colocar.mp3` | `card-place-1.ogg` de Casino Audio 1.1 de Kenney | CC0 1.0 |
| `sonidos/barajar.mp3` | `card-shuffle.ogg` de Casino Audio 1.1 de Kenney (primeros 1,2 s) | CC0 1.0 |
| `sonidos/abanico.mp3` | `card-fan-1.ogg` de Casino Audio 1.1 de Kenney | CC0 1.0 |

Casino Audio se descargó el 2026-11-06 de https://opengameart.org/sites/default/files/kenney_casino-audio.zip (página
https://opengameart.org/content/54-casino-sound-effects-cards-dice-chips, donde lo publicó Kenney; ficha oficial
https://kenney.nl/assets/casino-audio). SHA-256 del zip: `f36250766ac5bc378c13708ddf12a23a8e54a3251f8d482c7536e51b5dbafa18`.
Su `License.txt` dice: «Casino Audio (1.1) by Kenney Vleugels (Kenney.nl) — License (Creative Commons Zero, CC0) — You
may use these assets in personal and commercial projects. Credit (Kenney or www.kenney.nl) would be nice but is not
mandatory.» Es el mismo paquete que ya usa la Ruleta Celestial. Tratamiento con ffmpeg: recorte del silencio inicial,
recorte de duración con fundido de salida de 60 ms, mono a 44,1 kHz, pico a −3 dBFS y MP3 de 64 kbps.

Los demás sonidos (botón, cuenta de la vista previa, pareja con campanitas o burbujas, error, corazón que cae, pajaritos
del parque, burbujas del mar, derrota) y la base musical de respaldo (`?musica=sintetizada`) son síntesis propia con Web
Audio, sin muestras. Si una muestra no carga, suena la síntesis.

## Imágenes

| Archivo | Origen | Permiso |
|---|---|---|
| `img/logo.png` (628×640) y `img/logo.svg`, `img/bebe-sentado.png`, `img/bebe-ingeniero.png` | Copias sin cambios de `docs/maquetas/sopa-de-letras/img/` (logo de `Logo Baby Finger - Pantone_Carpeta/`, bebés de `BEBES PARA JUEGOS/`) | Recurso del propietario (marca Baby Finger) |
| `img/panal-pants.png`, `img/panal-g.png`, `img/panal-acuatico.png` (495×560) | `Pañal babyfinger pants G.png`, `front pañal talla g.png` y `pañal acuatico talla G.png` de `PRODUCTOS BABY FINGER`, reducidos con `sips` sin recortar ni deformar | Recurso del propietario |
| `img/toallita-azul.png`, `img/toallita-blanca.png`, `img/toallita-rosa.png` (560 px de ancho) | `toallita azul.png`, `toallita blanca.png` y `toallita rosa.png` de la misma carpeta, reducidos con `sips` y recortados solo en el margen transparente (el paquete queda entero) | Recurso del propietario |
| Cielo, colinas, flores, nubes, mariposas, agua, rayos de luz, arena, corales, algas, peces, burbujas, reversos y caras de las cartas, corazones, botones, confeti | Dibujados por código en la maqueta | Propio |
