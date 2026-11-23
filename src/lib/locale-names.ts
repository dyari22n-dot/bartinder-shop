/** تەنها کوردی بنووسرێت — عەرەبی/ئینگلیزی خۆکار یان جیاواز */
export function triName(
  ckb: string,
  ar?: string,
  en?: string,
): { nameCkb: string; nameAr: string; nameEn: string } {
  const nameCkb = ckb.trim();
  const a = ar?.trim();
  const e = en?.trim();
  return {
    nameCkb,
    nameAr: a && a !== nameCkb ? a : nameCkb,
    nameEn: e && e !== nameCkb ? e : nameCkb,
  };
}

export function triLabel(
  ckb: string,
  ar?: string,
  en?: string,
): { labelCkb: string; labelAr: string; labelEn: string } {
  const base = triName(ckb, ar, en);
  return {
    labelCkb: base.nameCkb,
    labelAr: base.nameAr,
    labelEn: base.nameEn,
  };
}

export function triTitle(
  ckb: string,
  ar?: string,
  en?: string,
): { titleCkb: string; titleAr: string; titleEn: string } {
  const base = triName(ckb, ar, en);
  return {
    titleCkb: base.nameCkb,
    titleAr: base.nameAr,
    titleEn: base.nameEn,
  };
}

export function optSubtitle(
  ckb?: string,
  ar?: string,
  en?: string,
):
  | { subtitleCkb?: string; subtitleAr?: string; subtitleEn?: string }
  | undefined {
  const c = ckb?.trim();
  if (!c) return undefined;
  const base = triName(c, ar, en);
  return {
    subtitleCkb: base.nameCkb,
    subtitleAr: base.nameAr,
    subtitleEn: base.nameEn,
  };
}

export const ADMIN_KURDISH_ONLY_HINT =
  "تەنها کوردی بنووسە — عەرەبی/ئینگلیزی خۆکار دەبێت";