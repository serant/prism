export const sortPages = pages => {
  console.log(pages);
  pages = pages.sort((a, b) => {
    return a - b;
  });
  return pages;
};

export const calculateSavings = bwPages => {
  return (bwPages.length * 0.3).toFixed(2);
};

export const calculateProgress = (bwPages, colorPages, totalPages) => {
  return Math.round(((bwPages.length + colorPages.length) * 100) / totalPages);
};
