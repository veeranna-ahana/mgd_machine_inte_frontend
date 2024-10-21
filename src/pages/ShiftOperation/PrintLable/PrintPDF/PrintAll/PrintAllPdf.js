import React, { Fragment, useEffect, useState } from "react";

import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
//import PDFdocument from './PDFdocument';

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    // backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

  const MyDoc = ({currentObject}) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>{currentObject}</Text>
        </View>
      </Page>
    </Document>
  );

export default function PrintAllPdf({currentObject}) {
  return (
    <Fragment>
      <PDFViewer width="1200" height="600" filename="somename.pdf">
      <MyDoc currentObject={currentObject}  />    
        </PDFViewer>
    </Fragment>
  );
}
