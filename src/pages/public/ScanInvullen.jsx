import KompasDot from "../../components/shared/KompasDot";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import { ADM } from "../../styles/tokens";

import {
  PIJLERS,
  DEFAULT_STELLINGEN,
} from "../../data/scanData";

import {
  berekenScanScoresVoorMeting,
  isVeiligheidLeiderschapVerdieping,
  isBelevingVeranderingVerdieping,
  isEnergieMotivatieVerdieping,
  isVerbeterenLerenVerdieping,
  isGecombineerdeVerdieping,
} from "../../lib/scanUtils";