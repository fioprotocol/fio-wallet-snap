export const validateFioHandle = (fioHandle: string) => {
  const regex = new RegExp('^(?:(?=.{3,64}$)[a-zA-Z0-9]{1}(?:(?:(?!-{2,}))[a-zA-Z0-9-]*[a-zA-Z0-9]+){0,1}@[a-zA-Z0-9]{1}(?:(?:(?!-{2,}))[a-zA-Z0-9-]*[a-zA-Z0-9]+){0,1}$)'); 

  return fioHandle &&
    typeof fioHandle === 'string' &&
    (fioHandle.length > 3 || fioHandle.length < 64) &&
    regex.test(fioHandle);
};
