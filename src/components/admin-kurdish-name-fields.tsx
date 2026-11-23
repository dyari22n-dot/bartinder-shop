import { ADMIN_KURDISH_ONLY_HINT } from "@/lib/locale-names";

type Fields = {
  ckb: string;
  ar?: string;
  en?: string;
};

export function AdminKurdishNameFields({
  values,
  onChange,
  ckbPlaceholder = "ناو (کوردی) *",
  showMore,
  onToggleMore,
}: {
  values: Fields;
  onChange: (patch: Partial<Fields>) => void;
  ckbPlaceholder?: string;
  showMore: boolean;
  onToggleMore: () => void;
}) {
  return (
    <>
      <div>
        <input
          placeholder={ckbPlaceholder}
          value={values.ckb}
          onChange={(e) => onChange({ ckb: e.target.value })}
        />
        <p className="mt-1 text-[10px] text-bk-muted">{ADMIN_KURDISH_ONLY_HINT}</p>
      </div>
      <button
        type="button"
        className="text-[11px] text-bk-muted underline"
        onClick={onToggleMore}
      >
        {showMore ? "کەمتر ▲" : "ناوی جیاواز (عەرەبی/ئینگلیزی) ▼"}
      </button>
      {showMore ? (
        <>
          <input
            placeholder="عربي (ئارەزوومەندانە)"
            value={values.ar ?? ""}
            onChange={(e) => onChange({ ar: e.target.value })}
          />
          <input
            placeholder="English (optional)"
            value={values.en ?? ""}
            onChange={(e) => onChange({ en: e.target.value })}
          />
        </>
      ) : null}
    </>
  );
}