'Imports System.Data.Odbc
Imports MySql.Data.MySqlClient
Public Class Form_ShiftSelection

    Dim MachineName As String

    Public Sub New()
        ' This call is required by the Windows Form Designer.
        InitializeComponent()

        ' Add any initialization after the InitializeComponent() call.
        BS_shift.DataSource = Machine.ShiftRegister
        ComboBox_Machine.DataSource = Machine.ActiveMachines

    End Sub
   
    Private Sub btnOpenShiftForm_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnOpenShiftForm.Click
        '**** If there are current shifts  then open
        If BS_shift.List.Count = 0 Then
            MsgBox("There is no current shift planned for this machine")
            Exit Sub
        End If
        


        Using X As New MachineLog(MachineName, DGV_Shift.CurrentRow.Cells("ShiftId").Value)
            X.WindowState = FormWindowState.Maximized
            X.ShowDialog()
        End Using

        'Using X As New MachineLog("Laser 1", 37295)
        '    X.WindowState = FormWindowState.Maximized
        '    X.ShowDialog()
        'End Using


    End Sub

   


    Private Sub ComboBox_Machine_SelectedIndexChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles ComboBox_Machine.SelectedIndexChanged
        Try
            MachineName = Me.ComboBox_Machine.SelectedValue
            BS_shift.Filter = String.Format("Machine='{0}'", MachineName)
        Catch ex As Exception
            MsgBox(ex.Message)
        End Try
    End Sub
End Class