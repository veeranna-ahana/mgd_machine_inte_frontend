import React from "react";
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#ffffff", // Set background color if needed
  },
  section: {
    width: 50,
    height: 25,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize:5
  },
});

const MyDoc = ({ selectRow }) => (
  <Document wrap={false}>
    <Page size={{ width: 50, height: 25 }} style={styles.page}>
      <View style={styles.section}>
        <Text>{selectRow}</Text>
      </View>
    </Page>
  </Document>
);

const PrintSelectedPdf = ({ selectRow }) => (
  <PDFViewer width="1200" height="600" filename="somename.pdf">
    <MyDoc selectRow={selectRow} />
  </PDFViewer>
);

export default PrintSelectedPdf;
