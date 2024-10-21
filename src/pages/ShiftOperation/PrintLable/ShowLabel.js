import React from "react";
import { PDFViewer, Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
  },
  section: {
    width: 50,
    height: 25,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 5,
  },
});

const MyDoc = ({ selectedRows }) => {
  console.log("selectedRows in MyDoc:", selectedRows);

  if (!selectedRows || !selectedRows.length) {
    return (
      <Document>
        <Page size={{ width: 50, height: 25 }} style={styles.page}>
          <View style={styles.section}>
            <Text>No data available</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size={{ width: 50, height: 25 }} style={styles.page}>
        <View style={styles.section}>
          <Text>{selectedRows}</Text>
        </View>
      </Page>
    </Document>
  );
};

const ShowLabel = ({ selectedRows }) => (
  <PDFViewer width="500" height="390" filename="somename.pdf">
    <MyDoc selectedRows={selectedRows} />
  </PDFViewer>
);

export default ShowLabel;
