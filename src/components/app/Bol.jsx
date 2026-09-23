// De bol bij iemands naam: zijn foto, of anders zijn initialen.
//
// Stond op zes plekken los als <span className="tk-bol">{initialen(naam)}</span>.
// Nu op één plek, want anders krijgt de ene lijst wel foto's en de andere niet.

import { initialen } from "../../lib/app/naam";
import { isFoto } from "../../lib/app/foto";

/**
 * @param naam   de volledige naam; alleen gebruikt als er geen foto is
 * @param foto   wat er in het ledendocument staat, of niets
 * @param klasse extra klassen, bijvoorbeeld tk-bol-groot
 *
 * De foto krijgt met opzet een lege alt. Naast elke bol in de app staat de
 * naam al, en "foto van Anouk" laat een schermlezer diezelfde naam twee keer
 * voorlezen. Wat er in het ledendocument staat schrijft een teamgenoot, niet
 * wij, dus het gaat eerst langs isFoto voor het een src in mag.
 */
export default function Bol({ naam, foto, klasse = "", ...rest }) {
  const bruikbaar = isFoto(foto);

  return (
    <span className={`tk-bol${klasse ? ` ${klasse}` : ""}`} {...rest}>
      {bruikbaar ? <img className="tk-bolfoto" src={foto} alt="" /> : initialen(naam)}
    </span>
  );
}
