function collateDocuments(documents) {
  let collatedDocuments = [];

  for (let i = 0; i < documents.length; i++) {
    const { pages, name } = documents[i];
    collatedDocuments.push(...collatePages(pages, name));
  }

  // Now order the collate documents by their first page
  collatedDocuments = collatedDocuments.sort((a, b) => {
    return a.firstPage - b.firstPage;
  });

  for (let i = 0; i < collatedDocuments.length; i++) {
    collatedDocuments[i]["name"] = `${i + 1} ${collatedDocuments[i]["name"]}`;
  }

  return collatedDocuments;
}

function collatePages(pages, name) {
  let documents = [];
  let currentDocument = {
    firstPage: pages[0],
    pages: [pages[0]],
    data: null,
    name
  };

  for (let i = 1; i < pages.length; i++) {
    if (
      pages[i] !==
      currentDocument.pages[currentDocument["pages"].length - 1] + 1
    ) {
      documents.push(currentDocument);
      currentDocument = {
        firstPage: pages[i],
        pages: [],
        data: null,
        name
      };
    }
    currentDocument.pages.push(pages[i]);
  }
  documents.push(currentDocument);

  return documents;
}
export default collateDocuments;
