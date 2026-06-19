type RecipeContentVersionInfoProps = {
  recipeVersion: number;
  versionCount: number;
};

function RecipeContentVersionInfo({
  recipeVersion,
  versionCount,
}: RecipeContentVersionInfoProps) {
  if (versionCount <= 1) return null;

  return (
    <section className="text-secondary text-sm">
      <p
        className="font-ibm-plex-mono text-right text-[11px] tracking-[0.12em] uppercase"
        aria-label={`Version ${recipeVersion + 1} of ${versionCount}`}
      >
        Version {recipeVersion + 1} of {versionCount}
      </p>
    </section>
  );
}

export default RecipeContentVersionInfo;
