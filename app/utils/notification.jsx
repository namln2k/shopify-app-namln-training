export function createErrorMessageFromArray(errors) {
  if (!errors) {
    return null;
  }

  if (errors.length === 1) {
    return errors[0];
  }

  return (
    <ul className="list-disc pl-8">
      {errors.map((error, index) => {
        return <li key={index}>{error}</li>;
      })}
    </ul>
  );
}
