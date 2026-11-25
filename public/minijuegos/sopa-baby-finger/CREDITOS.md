# Créditos y licencias de la maqueta de la Sopa de letras

Recursos de `docs/maquetas/sopa-de-letras/` (sprint B1, 2026-11-06). Al pasar a la APK se copian a `CREDITS.md` del
proyecto.

## Fuentes

| Archivo | Origen | Licencia |
|---|---|---|
| `fuentes/Fredoka-Bold.ttf` (SHA-256 `457525f9...6e52c`) y `fuentes/Fredoka-SemiBold.ttf` (SHA-256 `95839d50...12f9`), Fredoka de Milena Brandão y Hafontia, «Copyright 2016 The Fredoka Project Authors» | Repositorio del autor https://github.com/hafontia-zz/Fredoka-One, carpeta `fonts/ttf/`, commit `35c584ff23450c9bcdf8819706e12fcdeefe1712`, que es el que registra `ofl/fredoka/METADATA.pb` de github.com/google/fonts como origen. Se tomaron los estáticos porque google/fonts solo trae la versión variable y gdx-freetype no elige el peso de una fuente variable. Descargados el 2026-11-06 | SIL Open Font License 1.1; texto en `fuentes/OFL-Fredoka.txt`, copiado de `ofl/fredoka/OFL.txt` de google/fonts |

## Sonidos y música

| Archivo | Origen | Licencia |
|---|---|---|
| `sonidos/musica-fondo.mp3` | «Happy Clappy Loop» de OwlishMedia, https://opengameart.org/content/happy-clappy-loop (archivo `HappyClappyLoop.wav`, 17,4 s, SHA-256 `1ca66b4e...6554`), descargado el 2026-11-06. Tratamiento propio: mono, filtro de graves por debajo de 110 Hz para suavizar el golpe, +3 dB, MP3 de 80 kbps con ffmpeg | CC0 (dominio público), según la ficha de OpenGameArt consultada el 2026-11-06 |
| `sonidos/victoria.mp3` | `jingles_SAX10.ogg` de «Music Jingles» de Kenney (Kenney Vleugels), https://kenney.nl/assets/music-jingles, paquete `jingleSounds_Kenney.zip` de OpenGameArt. Es el mismo MP3 ya recortado de la Ruleta Celestial (`RULETAS PARA PANTALLAS/apps/ruleta-celestial/src/assets/sonidos/`) | CC0 1.0; verificado otra vez el 2026-11-06 en el `license.txt` del paquete |

Los demás sonidos (notas de la cinta, acierto, error, pérdida de corazón, tic de los últimos 10 s, botones, entrada,
fanfarria y derrota) y la base musical de respaldo (`?musica=sintetizada`) son síntesis propia con Web Audio, sin
muestras. Si una muestra no carga, suena la síntesis.

## Imágenes

| Archivo | Origen | Permiso |
|---|---|---|
| `img/logo.png` (628×640) y `img/logo.svg` | `Logo Baby Finger - Pantone_Carpeta/` de `PRODUCTOS BABY FINGER`, reducido con `sips` sin recortar ni deformar | Recurso del propietario (marca Baby Finger) |
| `img/bebe-sentado.png` (1024 px) y `img/bebe-ingeniero.png` (1400 px de alto) | `BEBES PARA JUEGOS/BEBE DEFINITIVO 3.png` y `BEBE INGENIERO-02.png`, reducidos con `sips` | Recurso del propietario |
| `img/panal-pants.png` y `img/panal-g.png` (560 px) | `Pañal babyfinger pants G.png` y `front pañal talla g.png`, reducidos con `sips` | Recurso del propietario |
| Cielo, nubes, colinas, flores, plato, caldo, letras de pasta, corazones, reloj, botones, confeti y burbujas | Dibujados por código en la maqueta | Propio |
