const showFormattedDate = (date, language = 'id') => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', options);
};

export { showFormattedDate };
