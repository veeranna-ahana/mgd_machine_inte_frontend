

Public Class MachineLog

    Dim _MachineName As String
    Private currentMachine As magod.Production.machinestatusRow



    Public Sub New(ByVal MachineName As String, ByVal ShiftId As Integer)

        ' This call is required by the Windows Form Designer.
        InitializeComponent()

        ' Add any initialization after the InitializeComponent() call.
        _MachineName = MachineName
        intShiftId = ShiftId
        setUp()
        setUpProdDA()
        Refresh_Timer.Start()
        BS_Operators.DataSource = Machine.getOperatorsList
        'BS_StoppageHeads.DataSource = Machine.getStoppagesType
        'BS_StoppageReasons.DataSource = Machine.getStoppagesReasons

        BS_RunningProgram.DataSource = dtRunningProgram
        BS_RunningProgramMaterial.DataSource = dtRunningProgramMaterialList
        BS_RunningProgramParts.DataSource = dtRunningProgramPartsList
        BS_RunningBOMIV.DataSource = dtRunningBOMIv
        BS_RunningBOMDetails.DataSource = dtRunningBOMDetails

        BS_ProdProgram.DataSource = dtShiftPrograms
        BS_ProdParts.DataSource = dtProdProgramPartsList
        BS_ProgramMaterial.DataSource = dtProdProgramMaterialList
        BS_ProgramBOMIv.DataSource = dtProdBOMIv
        BS_ProgramBOMDetails.DataSource = dtProdBOMDetails

        With Machine.getCommand
            .Connection.Open()
            '**** Load shift information
            .Parameters.Clear()
            .Parameters.AddWithValue("@shiftid", ShiftId)
            .CommandText = "SELECT d.* FROM magodmis.day_shiftregister d,magodmis.shiftregister s " _
                            & "WHERE s.`ShiftID`=@shiftid AND d.`DayShiftId`=s.`DayShiftID`;"
            Production1.day_shiftregister.Load(.ExecuteReader)

            .CommandText = "Select * From magodmis.ShiftRegister Where Shiftid=@Shiftid;"
            Production1.shiftregister.Load(.ExecuteReader)

            .CommandText = "SELECT * FROM magod_production.stoppage_category s;"
            Production1.stoppage_category.Load(.ExecuteReader)

            .Parameters.AddWithValue("@MachineName", MachineName)
            .CommandText = "SELECT * FROM magod_production.stoppagereasonlist s " _
            & "where s.Machine_Type='All' union " _
            & "SELECT s.* FROM magod_production.stoppagereasonlist s, " _
            & "machine_data.machine_list m WHERE m.`refName`=@MachineName AND s.Machine_Type=m.Machine_Type;"
            Production1.stoppagereasonlist.Load(.ExecuteReader)
            .Parameters.Clear()
            .Connection.Close()

        End With
        Machine_load()
        '** Load Current Program
        loadCurrentProgram()
    End Sub

#Region "Machine Setup and Shift Handling"
    Private Da_Machine, Da_NcProgram, Da_ShiftLog, Da_CurrentProgram, Da_ProgramMaterial, Da_currentPgmParts,
      DA_ProdPgme, Da_TaskMtrl, Da_ProdMtrlList, Da_ProdPartsList, DA_BOMIV, DA_BOMDetails As MySql.Data.MySqlClient.MySqlDataAdapter
    Private intShiftId As Integer
    Private strInsertUpdateNCProgramTime, strInsertUpdateStoppageTime As String
    Dim StoppageID As Integer
    Dim Opr, NCProgramNo, PgmExtn As String
    Private dtRunningProgram As New magod.Production.TaskProgramListDataTable
    Private dtRunningProgramMaterialList As New magod.Production.ncprogrammtrlallotmentlistDataTable
    Private dtRunningProgramPartsList As New magod.Production.NCProgramPartsListDataTable
    Private dtRunningBOMIv As New magod.Production.shopfloor_part__issueregisterDataTable
    Private dtRunningBOMDetails As New magod.Production.shopfloor_bom_issuedetailsDataTable
    Private dtRunningAssyBOM As New magod.Production.cust_assy_bom_listDataTable
    Private selectedProgram, currentProgram As magod.Production.TaskProgramListRow

    Private CurrentTime, ToTime, FromTime As DateTime

#Region "Start Up Current Program and Refresh"

    Sub Machine_load()
        '**** Laod Machine and its Programs
        Production1.machinestatus.Clear()
        Production1.TaskProgramList.Clear()
        Production1.shiftlogbook.Clear()


        Da_Machine.Fill(Production1.machinestatus)
        Da_NcProgram.Fill(Production1.TaskProgramList)
        Da_ShiftLog.Fill(Production1.shiftlogbook)
        refreshMachichineProgramList()

        currentMachine = Production1.machinestatus.FindByMachineName(_MachineName)
        currentMachine._Operator = Production1.shiftregister.Rows(0).Item("Operator")
        RefreshData()
        reviewTasks()
        'setLogTime()
    End Sub

    Private Sub loadCurrentProgram()
        Dim result As Integer

        dtRunningProgram.Clear()
        dtRunningProgramMaterialList.Clear()
        dtRunningProgramPartsList.Clear()
        dtRunningBOMDetails.Clear()
        dtRunningBOMIv.Clear()
        dtRunningAssyBOM.Clear()

        If BS_Machine.Current.item("TaskNo") <> "100" Then
            result = BS_MachineTaskList.Find("NCid", BS_Machine.Current.item("StopId"))
            If result <> -1 Then
                '*** Load the Last Program if still status cutting 


                '**** Load Program Material
                With Da_CurrentProgram
                    .SelectCommand.Parameters("@ncid").Value = BS_MachineTaskList.List(result).item("Ncid")
                    .Fill(dtRunningProgram)
                    currentProgram = dtRunningProgram.FindByNcid(BS_MachineTaskList.List(result).item("Ncid"))
                    If currentProgram.HasBOM Then
                        Me.DGV_PgmMtrl.Visible = False
                        Me.DGV_RunningBOMDetails.Visible = True
                        Me.Panel_RuningBOMIv.Visible = True
                        Me.Panel_Sheet.Visible = False
                        DA_BOMIV.SelectCommand.Parameters("@NCId").Value = BS_MachineTaskList.List(result).item("NcId")
                        DA_BOMIV.Fill(dtRunningBOMIv)
                        If Not dtRunningBOMIv.Rows.Count = 0 Then
                            DA_BOMDetails.SelectCommand.Parameters("@IV_ID").Value = dtRunningBOMIv.First.IssueID
                            DA_BOMDetails.Fill(dtRunningBOMDetails)
                        End If
                        Me.SplitContainer_Material.SplitterDistance = 0
                        btnTaskMtrl.Visible = False
                    Else
                        Me.DGV_PgmMtrl.Visible = True
                        Me.DGV_RunningBOMDetails.Visible = False
                        Me.Panel_RuningBOMIv.Visible = False
                        Me.Panel_Sheet.Visible = True
                        Da_ProgramMaterial.SelectCommand.Parameters("@NCId").Value = BS_MachineTaskList.List(result).item("NcId")
                        Da_ProgramMaterial.Fill(dtRunningProgramMaterialList)
                        Me.SplitContainer_Material.SplitterDistance = Me.SplitContainer_Material.Width
                        btnTaskMtrl.Visible = True
                    End If
                End With

                With Da_currentPgmParts
                    .SelectCommand.Parameters("@ncid").Value = currentProgram.Ncid
                    .Fill(dtRunningProgramPartsList)
                End With
                If dtRunningProgramPartsList.Rows.Count = 1 And currentProgram.HasBOM Then
                    With Machine.getCommand
                        .CommandText = "SELECT c1.* FROM magodmis.cust_assy_data c,magodmis.cust_assy_bom_list c1 " _
                                        & "WHERE c.`Cust_Code`=@Cust_Code AND  c.`AssyCust_PartId`=@AssyCust_PartId " _
                                        & "AND c1.`Cust_AssyId`=c.`Id`;"
                        .Parameters.Clear()
                        .Parameters.AddWithValue("@Cust_Code", currentProgram.Cust_Code)
                        .Parameters.AddWithValue("@AssyCust_PartId", dtRunningProgramPartsList.First.DwgName)
                        .Connection.Open()
                        dtRunningAssyBOM.Load(.ExecuteReader)
                        .Connection.Close()
                    End With

                End If

            End If
        Else
            currentProgram = dtRunningProgram.NewTaskProgramListRow

            With currentProgram
                .TaskNo = "100"
                .NCProgramNo = currentMachine.NCProgarmNo
                .Ncid = 0
                dtRunningProgram.AddTaskProgramListRow(currentProgram)
                ' .Operation = currentMachine.Operation
                Me.DGV_PgmMtrl.Visible = False
                Me.DGV_RunningBOMDetails.Visible = False
                Me.Panel_RuningBOMIv.Visible = False
                Me.Panel_Sheet.Visible = False
            End With

        End If


    End Sub
    Private Sub Refresh_Timer_Tick(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Refresh_Timer.Tick
        'If Not Machine.getCommand.Connection.State = ConnectionState.Closed Then
        '    Machine.getCommand.Connection.Close()
        'End If
        RefreshData()
    End Sub
    Private Sub RefreshData()
        '*** get Current Server Time


        '*** Set LOG to Current Time
        '***If there is no log entry then add entry starting from begining of shift
        '*** If an Entry exists Then Update Serial Time
        Dim cmd As MySql.Data.MySqlClient.MySqlCommand = Machine.getDBLink.getCommand

        Dim TSpan As TimeSpan = Machine.getCurDate.Subtract(currentMachine.ProgramStartTime)
        currentMachine.ProgMachineTime = TSpan.TotalMinutes
        TSpan = Machine.getCurDate.Subtract(currentMachine.SheetStartTime)
        currentMachine.SheetMachineTime = TSpan.TotalMinutes

        Da_Machine.Update(Production1.machinestatus)
        Dim Hours, Min As Int32
        Hours = Math.DivRem(currentMachine.ProgMachineTime, 60, Min)
        currentMachine.MachineHours = String.Format("{0} Hours {1} Min", Hours, Min)
        Hours = Math.DivRem(currentMachine.SheetMachineTime, 60, Min)
        currentMachine.SheetMachineHours = String.Format("{0} Hours {1} Min", Hours, Min)
        currentMachine.CurrentServerTime = Machine.getCurDate

        '***** Upadte Shift Log Book
        If Production1.shiftlogbook.Rows.Count = 0 Then
            add_Machine_logSrl(cmd)
        Else
            '**** Update Last Serial Time
            Production1.shiftlogbook.Last.ToTime = Machine.getCurDate
            Da_ShiftLog.Update(Production1.shiftlogbook)
        End If
        Production1.shiftlogbook.Last.RunningTime = Production1.shiftlogbook.Last.ToTime.Subtract(Production1.shiftlogbook.Last.FromTime).TotalMinutes


        setLogTime(cmd)

        '***** Reload Machine NCPrograms List

        With cmd
            .CommandText = " UPDATE magodmis.ncprograms n, " _
                & "(SELECT n.`Ncid`, Sum(TIMESTAMPDIFF(MINUTE,s.`FromTime`,s.`ToTime`)) as MachineTime " _
                & "FROM magodmis.ncprograms n,magodmis.shiftlogbook s WHERE n.`Machine`=@Machine " _
                & "AND n.`PStatus`='Cutting' AND s.`StoppageID`=n.`Ncid` GROUP BY n.`Ncid`) as A  " _
                & "SET n.`ActualTime`=A.MachineTime WHERE A.ncid=n.`Ncid`;"
            .Parameters.Clear()
            .Parameters.AddWithValue("@Machine", currentMachine.MachineName)

            .Connection.Open()
            .ExecuteNonQuery()
            .Connection.Close()
            .Parameters.Clear()
        End With


        Dim currentNCId As Integer = -1
        If Not BS_MachineTaskList.Current Is Nothing Then
            currentNCId = BS_MachineTaskList.Current.item("NcId")
        End If
        Production1.TaskProgramList.Clear()
        Da_NcProgram.Fill(Production1.TaskProgramList)
        BS_MachineTaskList.Position = BS_MachineTaskList.Find("NcId", currentNCId)
        For Each ncPgme As magod.Production.TaskProgramListRow In Production1.TaskProgramList.Rows
            Hours = Math.DivRem(ncPgme.EstimatedTime, 60, Min)
            ncPgme.EstmatedMachineTime = String.Format("{0} Hours {1} Min", Hours, Min)
            Hours = Math.DivRem(ncPgme.ActualTime, 60, Min)
            ncPgme.ActualMachineTime = String.Format("{0} Hours {1} Min", Hours, Min)

        Next
        If Not currentProgram Is Nothing AndAlso currentProgram.TaskNo <> "100" Then
            With currentProgram
                .EstmatedMachineTime = Production1.TaskProgramList.FindByNcid(.Ncid).EstmatedMachineTime
                .ActualMachineTime = Production1.TaskProgramList.FindByNcid(.Ncid).ActualMachineTime
            End With
        End If

        reviewTasks()
    End Sub
    Private Sub reviewTasks()
        For Each dr As DataGridViewRow In Me.DGV_Tasks.Rows
            If dr.Cells("Mtrl_Qty").Value = 0 Then
                dr.DefaultCellStyle.BackColor = Color.Crimson
            ElseIf dr.Cells("Mtrl_QtyAllotted").Value = 0 Then
                dr.DefaultCellStyle.BackColor = Color.LightCyan
            ElseIf dr.Cells("Mtrl_QtyCut").Value = 0 Then
                dr.DefaultCellStyle.BackColor = Color.LightSlateGray
            ElseIf dr.Cells("Mtrl_QtyCut").Value = dr.Cells("Mtrl_Qty").Value Then
                dr.DefaultCellStyle.BackColor = Color.Green
            ElseIf dr.Cells("Mtrl_QtyCut").Value = dr.Cells("Mtrl_QtyAllotted").Value Then
                dr.DefaultCellStyle.BackColor = Color.GreenYellow
            Else
                dr.DefaultCellStyle.BackColor = Color.LightCoral
            End If

            If Not IsDBNull(dr.Cells("Pgme_Remarks").Value) Then
                dr.DefaultCellStyle.BackColor = Color.Crimson

            End If

        Next

    End Sub

    Private Sub LoadTaskMtrl()

        Production1.ncprogrammtrlallotmentlist.Clear()

        Da_TaskMtrl.SelectCommand.Parameters("@NCId").Value = DGV_Tasks.CurrentRow.Cells("Ncid").Value
        Da_TaskMtrl.Fill(Production1.ncprogrammtrlallotmentlist)


    End Sub
    Private Sub LoadTaskBOM()
        Production1.shopfloor_bom_issuedetails.Clear()
        Production1.shopfloor_part__issueregister.Clear()

        DA_BOMIV.SelectCommand.Parameters("@NCId").Value = DGV_Tasks.CurrentRow.Cells("Ncid").Value
        DA_BOMIV.Fill(Production1.shopfloor_part__issueregister)
        If Production1.shopfloor_part__issueregister.Rows.Count > 0 Then
            DA_BOMDetails.SelectCommand.Parameters("@IV_ID").Value = Production1.shopfloor_part__issueregister.First.IssueID
            DA_BOMDetails.Fill(Production1.shopfloor_bom_issuedetails)
        End If


    End Sub
    Private Sub load_NcProgram()
        If Production1.TaskProgramList.Rows.Count = 0 Then
            MsgBox("No Programs Scheduled for this Machine, Check with Production In -Charge")
            Exit Sub
        End If
        Dim selectedNCPgme As magod.Production.TaskProgramListRow = Production1.TaskProgramList.FindByNcid(DGV_Tasks.CurrentRow.Cells("Ncid").Value)
        If selectedNCPgme Is Nothing Then
            MsgBox("Check for Program Selection")
            Exit Sub
        End If
        ' ** Do Not change if The Same NC program is selected
        If selectedNCPgme.NCProgramNo = currentMachine.NCProgarmNo Then

            Exit Sub
        End If

        ' If Material Allotted has been used then ask why he wants to load the program
        If Not selectedNCPgme.HasBOM Then
            If CheckProgramMaterial("Used") = "Used" Then
                MsgBox("Cannot load Program once alloted material is used or rejected : No Material to Process")
                Exit Sub
            End If
        Else
            If Production1.shopfloor_part__issueregister.Rows.Count = 0 Then
                MsgBox("Cannot load Program once alloted material is used or rejected : No Material to Process")
                Exit Sub
            End If
        End If

        If MsgBox("Do you wish to load NC Program No :" _
            & selectedNCPgme.NCProgramNo, MsgBoxStyle.YesNo) = MsgBoxResult.Yes Then

            ' ****Load NC Program to current Task
            Try
                StoppageID = 0
                With currentMachine
                    .NCProgarmNo = selectedNCPgme.NCProgramNo
                    .TaskNo = selectedNCPgme.TaskNo
                    .StopID = selectedNCPgme.Ncid
                    .Mtrl_Code = selectedNCPgme.Mtrl_Code
                    .MtrlID = ""
                    .Process = selectedNCPgme.MProcess
                    If selectedNCPgme.IsOperationNull Then
                        .Operation = "Not Defined"
                    Else
                        .Operation = selectedNCPgme.Operation
                    End If


                    .ProgramStartTime = Machine.getCurDate
                    .ProgMachineTime = 0
                    .MachineHours = "0 Hours : 0 Minutes"
                    .SheetStartTime = .ProgramStartTime
                    .SheetMachineTime = 0
                    .SheetMachineHours = "0 Hours : 0 Minutes"
                End With
                upDateMachineStatus()
                LoadTaskProgram(StoppageID) '****** It is NCId of program


            Catch ex As Exception
                MsgBox(ex.Message)

            End Try





        End If
    End Sub
    Private Function upDateMachineStatus() As Boolean
        With Machine.getCommand
            .CommandText = "UPDATE machine_data.machinestatus m " _
                    & " SET m.`NCProgarmNo`=@NCProgarmNo, m.`TaskNo`=@TaskNo, m.`ProgramStartTime`=now(), " _
                   & " m.mtrl_Code=@mtrl_Code,m.mtrlid='', m.mprocess=@mprocess , m.stopid=@stopid,m.SheetStartTime=now(),m.ProgMachineTime=0," _
                   & "  m.SheetMachineTime=0 WHERE m.`MachineName`=@MachineName; "
            With .Parameters
                .Clear()
                .AddWithValue("@NCProgarmNo", currentMachine.NCProgarmNo)
                .AddWithValue("@TaskNo", currentMachine.TaskNo)
                .AddWithValue("@mtrl_Code", currentMachine.Mtrl_Code)
                .AddWithValue("@mprocess", currentMachine.Process)
                .AddWithValue("@stopid", currentMachine.StopID)
                .AddWithValue("@MachineName", currentMachine.MachineName)
            End With

            .Connection.Open()
            .ExecuteNonQuery()
            .Connection.Close()
            .Parameters.Clear()
        End With
        add_Machine_logSrl(Machine.getCommand)

        RefreshData()

        StoppageID = currentMachine.StopID
        NCProgramNo = currentMachine.NCProgarmNo
        PgmExtn = currentMachine.NcExtn
    End Function
    Private Function CheckProgramMaterial(ByVal type As String) As String
        Dim Result As String = "Check"
        ' Dim Dr As DataRow()
        ' Dim sheetCount, ResultCount As Integer
        Select Case type
            Case "Used"
                Dim strFilter As String = String.Format("Used or Rejected")
                Dim qtyUsed As Integer = dtProdProgramMaterialList.Compute("Count([ShapeMtrlID])", "Used=True Or Rejected=True")

                '*** Check Alloted Sheets
                '*** If all Sheets are either used or rejected return used else allow
                If Production1.ncprogrammtrlallotmentlist.Rows.Count = qtyUsed Then


                    Return "Used"
                Else

                    Return "Proceed"
                End If

            Case "Completed"
                Dim strFilter As String = String.Format("Used or Rejected")
                Dim qtyUsed As Integer = dtProdProgramMaterialList.Compute("Count([ShapeMtrlID])", "Used=True Or Rejected=True")

                If dtProdProgramMaterialList.Rows.Count = qtyUsed Then

                    Return "Completed"
                Else

                    Return "Use Material"
                End If

        End Select
        Return Result
    End Function
    Private Sub LoadTaskProgram(ByVal Nc_Id As Integer)
        ''**** Save Old Details
        BS_RunningProgram.EndEdit()
        BS_RunningProgramMaterial.EndEdit()
        BS_RunningProgramParts.EndEdit()
        If currentProgram.Ncid <> 0 Then
            'Da_CurrentProgram.Update(dtRunningProgram)
            Da_ProgramMaterial.Update(dtRunningProgramMaterialList)
            Da_currentPgmParts.Update(dtRunningProgramPartsList)
        End If


        ''**** Load Program Material
        dtRunningProgram.Clear()
        dtRunningProgramMaterialList.Clear()
        dtRunningProgramPartsList.Clear()
        dtRunningBOMDetails.Clear()
        dtRunningBOMIv.Clear()
        dtRunningAssyBOM.Clear()
        If Not Nc_Id = 0 Then
            ''*** Load selected  NC Program
            load_NcProgram()

            With Da_CurrentProgram
                .SelectCommand.Parameters("@ncid").Value = Nc_Id
                .Fill(dtRunningProgram)
                currentProgram = dtRunningProgram.FindByNcid(Nc_Id)
                If currentProgram.HasBOM Then
                    Me.DGV_PgmMtrl.Visible = False
                    Me.DGV_RunningBOMDetails.Visible = True
                    Me.Panel_RuningBOMIv.Visible = True
                    Me.Panel_Sheet.Visible = False
                    DA_BOMIV.SelectCommand.Parameters("@NCId").Value = Nc_Id
                    DA_BOMIV.Fill(dtRunningBOMIv)
                    If Not dtRunningBOMIv.Rows.Count = 0 Then
                        DA_BOMDetails.SelectCommand.Parameters("@IV_ID").Value = dtRunningBOMIv.First.IssueID
                        DA_BOMDetails.Fill(dtRunningBOMDetails)

                    End If

                    Me.SplitContainer_Material.SplitterDistance = 0
                    btnTaskMtrl.Visible = False
                Else
                    Me.DGV_PgmMtrl.Visible = True
                    Me.DGV_RunningBOMDetails.Visible = False
                    Me.Panel_RuningBOMIv.Visible = False
                    Me.Panel_Sheet.Visible = True
                    Da_ProgramMaterial.SelectCommand.Parameters("@NCId").Value = Nc_Id
                    Da_ProgramMaterial.Fill(dtRunningProgramMaterialList)
                    Me.SplitContainer_Material.SplitterDistance = Me.SplitContainer_Material.Width
                    btnTaskMtrl.Visible = True
                End If

            End With

            With Da_currentPgmParts
                .SelectCommand.Parameters("@ncid").Value = Nc_Id
                .Fill(dtRunningProgramPartsList)
            End With

            With Machine.getCommand
                .CommandText = "SELECT c1.* FROM magodmis.cust_assy_data c,magodmis.cust_assy_bom_list c1 " _
                                & "WHERE c.`Cust_Code`=@Cust_Code AND  c.`AssyCust_PartId`=@AssyCust_PartId " _
                                & "AND c1.`Cust_AssyId`=c.`Id`;"
                .Parameters.Clear()
                .Parameters.AddWithValue("@Cust_Code", currentProgram.Cust_Code)
                If dtRunningProgramPartsList.Rows.Count = 0 Then
                    .Parameters.AddWithValue("@AssyCust_PartId", "No Part")
                Else

                    .Parameters.AddWithValue("@AssyCust_PartId", dtRunningProgramPartsList.First.DwgName)
                End If

                .Connection.Open()
                dtRunningAssyBOM.Load(.ExecuteReader)
                .Connection.Close()
            End With
        Else
            currentProgram = dtRunningProgram.NewTaskProgramListRow

            With currentProgram
                .TaskNo = "100"
                .NCProgramNo = currentMachine.NCProgarmNo
                .Ncid = 0
                dtRunningProgram.AddTaskProgramListRow(currentProgram)
                ' .Operation = currentMachine.Operation
                Me.DGV_PgmMtrl.Visible = False
                Me.DGV_RunningBOMDetails.Visible = False
                Me.Panel_RuningBOMIv.Visible = False
                Me.Panel_Sheet.Visible = False
            End With

        End If


    End Sub

#End Region

    '***** Records LogBookTime into Shift Stoppagelist Table and ncprogrammachinelog table
    Private Sub setLogTime(ByRef cmd As MySql.Data.MySqlClient.MySqlCommand)
        '***** Records LogBookTime into Shift Stoppagelist Table and ncprogrammachinelog table

        With cmd
            Try
                .CommandText = "INSERT INTO magodmis.shiftstoppagelist ( shiftlogid,ShiftID," _
                                         & "StoppageID, StoppageReason, StoppageHead, Machine, FromTime, " _
                                         & "ToTime, Remarks, Locked,Operator) " _
                                         & "VALUES( @shiftlogid,@ShiftID," _
                                         & "@StoppageID, @StoppageReason, @StoppageHead, @Machine, @FromTime, " _
                                         & "@ToTime, @Remarks, @Locked,@Operator) " _
                                        & "ON DUPLICATE KEY UPDATE ToTime=@ToTime;"
                .Connection.Open()
                For Each ShiftSrl As magod.Production.shiftlogbookRow In
                Production1.shiftlogbook.Select(String.Format("Taskno='100'"))

                    With .Parameters
                        .Clear()
                        .AddWithValue("@shiftlogid", ShiftSrl.ShiftLogId)
                        .AddWithValue("@ShiftID", ShiftSrl.ShiftID)
                        .AddWithValue("@StoppageID", ShiftSrl.StoppageID)
                        .AddWithValue("@StoppageReason", ShiftSrl.Program)
                        .AddWithValue("@StoppageHead", ShiftSrl.StoppageID)
                        .AddWithValue("@Machine", ShiftSrl.Machine)
                        .AddWithValue("@FromTime", ShiftSrl.FromTime)
                        If ShiftSrl.IsRemarksNull Then
                            .AddWithValue("@Remarks", Nothing)
                        Else
                            .AddWithValue("@Remarks", ShiftSrl.Remarks)
                        End If

                        .AddWithValue("@ToTime", ShiftSrl.ToTime)
                        .AddWithValue("@Locked", ShiftSrl.Locked)
                        .AddWithValue("@Operator", ShiftSrl._Operator)

                    End With
                    .ExecuteNonQuery()

                Next

                .CommandText = "INSERT INTO magodmis.ncprogrammachinelog (ShiftlogID,TaskNo, " _
                               & "NCProgramNo, Operator,FromTime, ToTime, Machine,MProcess,Remarks," _
                               & "ShiftID,SheetsCut,LogUpdate,NcId,TotalTime ) " _
                               & "VALUES (@ShiftlogID,@TaskNo,@NCProgramNo, @Operator,@FromTime, @ToTime, " _
                               & "@Machine,@MProcess,@Remarks,@ShiftID,@SheetsCut,@LogUpdate,@NcId,@TotalTime ) " _
                               & "ON DUPLICATE KEY UPDATE SheetsCut=@SheetsCut,ToTime=@ToTime,TotalTime=@TotalTime;"


                For Each ShiftSrl As magod.Production.shiftlogbookRow In
                        Production1.shiftlogbook.Select("Taskno<>'100'")
                    ShiftSrl.RunningTime = ShiftSrl.ToTime.Subtract(ShiftSrl.FromTime).TotalMinutes
                    If ShiftSrl.RunningTime > 2 Then


                        With .Parameters
                            .Clear()
                            .AddWithValue("@shiftlogid", ShiftSrl.ShiftLogId)
                            .AddWithValue("@TaskNo", ShiftSrl.TaskNo)
                            .AddWithValue("@NCProgramNo", ShiftSrl.Program)
                            .AddWithValue("@Operator", ShiftSrl._Operator)
                            .AddWithValue("@FromTime", ShiftSrl.FromTime)
                            .AddWithValue("@ToTime", ShiftSrl.ToTime)

                            .AddWithValue("@Machine", ShiftSrl.Machine)
                            .AddWithValue("@MProcess", ShiftSrl.MProcess)
                            If ShiftSrl.IsRemarksNull Then
                                .AddWithValue("@Remarks", Nothing)
                            Else
                                .AddWithValue("@Remarks", ShiftSrl.Remarks)
                            End If

                            .AddWithValue("@ShiftID", ShiftSrl.ShiftID)
                            .AddWithValue("@SheetsCut", ShiftSrl.QtyProcessed)
                            .AddWithValue("@LogUpdate", True)
                            .AddWithValue("@NcId", ShiftSrl.StoppageID)
                            .AddWithValue("@TotalTime", ShiftSrl.RunningTime)

                        End With
                        .ExecuteNonQuery()
                    End If
                Next



            Catch ex As Exception
                MsgBox(ex.Message)
            End Try
            .Connection.Close()
        End With


    End Sub

    Private Sub add_Machine_logSrl(ByRef cmd As MySql.Data.MySqlClient.MySqlCommand)
        Dim firstEntry As Boolean
        '*****Update Old Time before Creating New
        If Production1.shiftlogbook.Rows.Count > 0 Then
            Production1.shiftlogbook.Last.ToTime = Machine.getCurDate
            firstEntry = False
        Else
            firstEntry = True
        End If

        '**** Confirm Program For First Entry

        If firstEntry Then
            If MsgBox("Is Program " & BS_Machine.Current.item("NCProgarmNo") & " running from the begining of this shift?", MsgBoxStyle.YesNo) = MsgBoxResult.No Then
                firstEntry = False
            End If
        End If
        '****** Ensure The Current Task and Programs data is correct
        '**** Insert New Serial into Machine Log Book
        Dim newShiftSrl As magod.Production.shiftlogbookRow = Production1.shiftlogbook.NewshiftlogbookRow
        With newShiftSrl
            .Item("ShiftID") = intShiftId
            .Item("Machine") = currentMachine.MachineName


            .Item("TaskNo") = currentMachine.TaskNo
            .Item("Program") = currentMachine.NCProgarmNo
            .Item("Operator") = currentMachine._Operator
            .Item("StoppageID") = currentMachine.StopID

            If currentMachine.IsProcessNull Then
                ' .Item("MProcess") = "Stoppage"
            Else
                .Item("MProcess") = currentMachine.Process
            End If

            If firstEntry Then
                .Item("FromTime") = BS_Shift.Current.item("FromTime")
                .Item("Operator") = BS_Machine.Current.item("Operator")

            Else
                .Item("FromTime") = Machine.getCurDate

            End If
            .Item("ToTime") = Machine.getCurDate
            newShiftSrl.Srl = Production1.shiftlogbook.Rows.Count + 1
            With cmd
                .Parameters.Clear()
                .CommandText = "INSERT INTO magodmis.shiftlogbook(ShiftId,Machine," _
            & "MProcess,TaskNo,Program,Operator,StoppageID,FromTime,ToTime,Srl) " _
            & "Values(@ShiftId,@Machine,@MProcess,@TaskNo,@Program,@Operator,@StoppageID,@FromTime,@ToTime,@Srl)"

                With .Parameters
                    .Clear()
                    .AddWithValue("@ShiftId", newShiftSrl.ShiftID)
                    .AddWithValue("@Machine", newShiftSrl.Machine)
                    .AddWithValue("@MProcess", newShiftSrl.MProcess)
                    .AddWithValue("@TaskNo", newShiftSrl.TaskNo)
                    .AddWithValue("@Program", newShiftSrl.Program)
                    .AddWithValue("@Operator", newShiftSrl._Operator)
                    .AddWithValue("@StoppageID", newShiftSrl.StoppageID)
                    .AddWithValue("@FromTime", newShiftSrl.FromTime)
                    .AddWithValue("@ToTime", newShiftSrl.ToTime)
                    .AddWithValue("@Srl", newShiftSrl.Srl)
                End With
                .Connection.Open()
                .ExecuteNonQuery()
                .CommandText = "SELECT LAST_INSERT_ID();"
                newShiftSrl.ShiftLogId = .ExecuteScalar
                .Connection.Close()
                Production1.shiftlogbook.AddshiftlogbookRow(newShiftSrl)
                newShiftSrl.AcceptChanges()
            End With
        End With

    End Sub
    Private Sub btnOperator_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnOperator.Click
        '**** Show the Operator Pull Down
        If Me.ComboBox_Operator.Visible = True Then
            Me.ComboBox_Operator.Visible = False
            currentMachine._Operator = ComboBox_Operator.SelectedValue
        Else
            Me.ComboBox_Operator.Visible = True
        End If
    End Sub

    Private Sub DGV_ShiftLog_CellDoubleClick(ByVal sender As Object, ByVal e As System.Windows.Forms.DataGridViewCellEventArgs) Handles DGV_ShiftLog.CellDoubleClick
        If DGV_ShiftLog.Columns(e.ColumnIndex).Name = "FTime" Then
            'DGV_ShiftLog.Columns(e.ColumnIndex).DefaultCellStyle.Format = "dd/MM/yy HH:mm"
            FromTime = DGV_ShiftLog.Rows(e.RowIndex).Cells(e.ColumnIndex).Value
            DGV_ShiftLog.Rows(e.RowIndex).Cells(e.ColumnIndex).Style.Format = "dd/MM/yy HH:mm"
        End If
        If DGV_ShiftLog.Columns(e.ColumnIndex).Name = "Ttime" Then
            'DGV_ShiftLog.Columns(e.ColumnIndex).DefaultCellStyle.Format = "dd/MM/yy HH:mm"
            ToTime = DGV_ShiftLog.Rows(e.RowIndex).Cells(e.ColumnIndex).Value
            DGV_ShiftLog.Rows(e.RowIndex).Cells(e.ColumnIndex).Style.Format = "dd/MM/yy HH:mm"
        End If
    End Sub

    Private Sub DGV_ShiftLog_CellValidated(ByVal sender As Object, ByVal e As System.Windows.Forms.DataGridViewCellEventArgs) Handles DGV_ShiftLog.CellValidated
        If DGV_ShiftLog.Columns(e.ColumnIndex).Name = "LogFromTime" Then
            If DGV_ShiftLog.CurrentRow.Cells("LogFromTime").Value < BS_Shift.Current.item("FromTime") _
                Or DGV_ShiftLog.CurrentRow.Cells("LogFromTime").Value > BS_Shift.Current.item("ToTime") _
                Or DGV_ShiftLog.CurrentRow.Cells("LogFromTime").Value > DGV_ShiftLog.CurrentRow.Cells("LogToTime").Value Then
                MsgBox("Value entered for 'To Time' has to be within the shift and less than 'To Time' ")
                DGV_ShiftLog.CurrentRow.Cells("LogFromTime").Value = FromTime
            End If
            DGV_ShiftLog.Rows(e.RowIndex).Cells(e.ColumnIndex).Style.Format = "dd/MM HH:mm"
        End If
        If DGV_ShiftLog.Columns(e.ColumnIndex).Name = "LogToTime" Then
            If DGV_ShiftLog.CurrentRow.Cells("LogToTime").Value < BS_Shift.Current.item("FromTime") _
          Or DGV_ShiftLog.CurrentRow.Cells("LogToTime").Value > BS_Shift.Current.item("ToTime") _
          Or DGV_ShiftLog.CurrentRow.Cells("LogFromTime").Value > DGV_ShiftLog.CurrentRow.Cells("LogToTime").Value Then
                MsgBox("Value entered for 'from Time' has to be within the shift and Greater than 'From Time' ")
                DGV_ShiftLog.CurrentRow.Cells("LogToTime").Value = ToTime
            End If
            DGV_ShiftLog.Rows(e.RowIndex).Cells(e.ColumnIndex).Style.Format = "dd/MM HH:mm"
        End If
    End Sub


    Private Sub DGV_ShiftLog_DataError(ByVal sender As Object, ByVal e As System.Windows.Forms.DataGridViewDataErrorEventArgs) Handles DGV_ShiftLog.DataError
        If DGV_ShiftLog.Columns(e.ColumnIndex).Name = "LogFromTime" Then
            MsgBox("Enter Date Time value in 'dd/MM/yy HH:mm' Format")
            DGV_ShiftLog.CurrentRow.Cells("LogFromTime").Value = FromTime
            e.Cancel = True
        End If
        If DGV_ShiftLog.Columns(e.ColumnIndex).Name = "LogToTime" Then
            MsgBox("Enter Date Time value in 'dd/MM/yy HH:mm' Format")
            DGV_ShiftLog.CurrentRow.Cells("LogToTime").Value = ToTime
            e.Cancel = True
        End If
    End Sub

    Private Sub DGV_ShiftLog_RowEnter(ByVal sender As System.Object, ByVal e As System.Windows.Forms.DataGridViewCellEventArgs) Handles DGV_ShiftLog.RowEnter
        If Not DGV_ShiftLog.CurrentRow Is Nothing Then
            ' MsgBox(DGV_ShiftLog.Rows(e.RowIndex).Cells("Program").Value)
            If DGV_ShiftLog.Rows(e.RowIndex).Cells("Locked").Value = True Then
                DGV_ShiftLog.Rows(e.RowIndex).ReadOnly = True
            Else
                'ToTime = DGV_ShiftLog.Rows(e.RowIndex).Cells("TTime").Value
                'FromTime = DGV_ShiftLog.Rows(e.RowIndex).Cells("FTime").Value
                DGV_ShiftLog.Rows(e.RowIndex).ReadOnly = False
            End If
        End If

    End Sub
    Private Sub btnStoppage_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnStoppage.Click
        If Me.ComboBox_StoppageList.Visible = True Then
            Me.ComboBox_StoppageList.Visible = False
            Me.cmb_StopGp.Visible = False
        Else
            Me.ComboBox_StoppageList.Visible = True
            Me.cmb_StopGp.Visible = True
        End If
    End Sub
    Private Sub ComboBox_StoppageList_SelectedIndexChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles ComboBox_StoppageList.SelectedIndexChanged


        If ComboBox_StoppageList.SelectedIndex = -1 Then
            Exit Sub
        End If
        StoppageID = Me.ComboBox_StoppageList.SelectedValue
        If currentMachine.StopID = StoppageID Then
            MsgBox("already loaded")
            Exit Sub
        End If
        If MsgBox("Do you wish to Stop the Cutting for " & Me.ComboBox_StoppageList.Text, MsgBoxStyle.YesNo) = MsgBoxResult.Yes Then
            ' ****Load NC Program to current Task
            Try
                StoppageID = 0
                With currentMachine
                    .NCProgarmNo = ComboBox_StoppageList.SelectedText
                    .TaskNo = "100"
                    .StopID = Me.ComboBox_StoppageList.SelectedValue
                    .Mtrl_Code = ""
                    .MtrlID = ""
                    .Process = cmb_StopGp.SelectedText
                    .Operation = "Not Defined"
                    .ProgramStartTime = Machine.getCurDate
                    .ProgMachineTime = 0
                    .MachineHours = "0 Hours : 0 Minutes"
                    .SheetStartTime = .ProgramStartTime
                    .SheetMachineTime = 0
                    .SheetMachineHours = "0 Hours : 0 Minutes"
                End With
                upDateMachineStatus()
                LoadTaskProgram(0) '****** It is NCId of program
            Catch ex As Exception
                MsgBox(ex.Message)

            End Try


            Me.ComboBox_StoppageList.Visible = False
            Me.cmb_StopGp.Visible = False

        End If
    End Sub

#Region "Setup DataAdoptores"
    Private Sub setUp()
        setUp_DAMachineStatus()
        setUpTaskDA()
        setUpShiftLog()
        setupCurrentProgram()
        setUpCurrentMaterial()
        setUpCurrentParts()
        setUpBOM()

    End Sub
    Private Sub setUpTaskDA()
        Da_NcProgram = Machine.getDBLink.getMySqlDataAdopter
        With Da_NcProgram
            With .SelectCommand
                .CommandText = "SELECT n.*, c.cust_name FROM magodmis.ncprograms n," _
                    & "magodmis.prioritytable p,magodmis.cust_data c " _
                    & "WHERE n.`Machine` =@Machine AND (n.`PStatus`='Cutting' or n.`PStatus`='Processing') " _
                    & "AND p.`Priority`=n.`Priority` And n.`cust_code`= c.`cust_code` " _
                    & "ORDER BY p.`Seniority`; "
                .Parameters.AddWithValue("@Machine", _MachineName)

            End With

            With .UpdateCommand
                .CommandText = "Update magodmis.NcPrograms Set  PStatus=@PStatus  " _
                    & "Where  NCId=@NCId;"
                .Parameters.Add("@NCId", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "NcId")
                .Parameters.Add("@PStatus", MySql.Data.MySqlClient.MySqlDbType.VarChar, 40, "PStatus")
            End With

        End With
        reviewTasks()
        '*********** Load Material for task for review
        Da_TaskMtrl = Machine.getDBLink.getMySqlDataAdopter
        With Da_TaskMtrl
            With .SelectCommand
                .CommandText = "Select * From magodmis.ncprogrammtrlallotmentlist Where NcID=@NcID;"
                .Parameters.Add("@NcID", MySql.Data.MySqlClient.MySqlDbType.Int32)

            End With
        End With
    End Sub
    Private Sub setUp_DAMachineStatus()
        Da_Machine = Machine.getDBLink.getMySqlDataAdopter
        With Da_Machine
            With .SelectCommand
                .CommandText = "SELECT m.*,now()as CurrentServerTime " _
             & "FROM machine_data.machinestatus m WHERE m.MachineName=@MachineName;"
                .Parameters.AddWithValue("@MachineName", _MachineName)
            End With
            ' .Fill(Production1.machinestatus)
            For Each Mac As magod.Production.machinestatusRow In Production1.machinestatus.Rows
                Dim Hours, Min As Int32
                Hours = Math.DivRem(Mac.ProgMachineTime, 60, Min)
                Mac.MachineHours = String.Format("{0} Hours {1} Min", Hours, Min)
            Next
            With .UpdateCommand
                .CommandText = "UPDATE machine_data.machinestatus m SET m.`ProgMachineTime`=@ProgMachineTime ," _
                & "SheetMachineTime=@SheetMachineTime,Operator =@Operator " _
                & "WHERE m.`MachineName`=@MachineName;"
                .Parameters.Add("@ProgMachineTime", MySql.Data.MySqlClient.MySqlDbType.Int16, 20, "ProgMachineTime")
                .Parameters.Add("@SheetMachineTime", MySql.Data.MySqlClient.MySqlDbType.Int16, 20, "SheetMachineTime")
                .Parameters.Add("@Operator", MySql.Data.MySqlClient.MySqlDbType.VarChar, 45, "Operator")
                .Parameters.Add("@MachineName", MySql.Data.MySqlClient.MySqlDbType.VarChar, 45, "MachineName")
            End With

        End With
    End Sub
    Private Sub setUpShiftLog()
        Da_ShiftLog = Machine.getDBLink.getMySqlDataAdopter
        With Da_ShiftLog

            With .SelectCommand
                .CommandText = "SELECT  s.* FROM magodmis.shiftlogbook s WHERE s.`ShiftID`=@ShiftID;"
                .Parameters.AddWithValue("@ShiftID", intShiftId)
            End With

            '***** UPDATE COMMAND 

            With .UpdateCommand
                .CommandText = "UPDATE magodmis.shiftlogbook s " _
                & "SET s.Remarks =@Remarks, s.Srl=@Srl,s.ToTime=@ToTime, s.Locked=@Locked, s.`QtyProcessed`=@QtyProcessed " _
                                & "WHERE s.ShiftLogId=@ShiftLogId;"
                With .Parameters
                    .Add("@Remarks", MySql.Data.MySqlClient.MySqlDbType.VarChar, 100, "Remarks")
                    .Add("@Srl", MySql.Data.MySqlClient.MySqlDbType.Int32, 10, "Srl")
                    .Add("@ToTime", MySql.Data.MySqlClient.MySqlDbType.DateTime, 20, "ToTime")
                    .Add("@Locked", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "Locked")
                    .Add("@QtyProcessed", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "QtyProcessed")
                    .Add("@ShiftLogId", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "ShiftLogId")

                End With

            End With


            ' ****** Delete Command
            With .DeleteCommand
                .CommandText = "DELETE  FROM magodmis.shiftlogbook  " _
                        & "WHERE ShiftLogId=@ShiftLogId;"
                .Parameters.Add("@ShiftLogId", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "ShiftLogId")
            End With
        End With
    End Sub
    Private Sub setupCurrentProgram()
        Da_CurrentProgram = Machine.getDBLink.getMySqlDataAdopter
        With Da_CurrentProgram
            With .SelectCommand
                .CommandText = "SELECT * FROM magodmis.ncprograms n WHERE n.`Ncid`=@Ncid;"
                .Parameters.Add("@Ncid", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With
        End With
    End Sub
    Private Sub setUpCurrentMaterial()
        Da_ProgramMaterial = Machine.getDBLink.getMySqlDataAdopter
        With Da_ProgramMaterial

            With .SelectCommand
                .CommandText = "Select * From Magodmis.ncprogrammtrlallotmentlist n " _
                                & "WHERE n.`NCId`=@NCId ORDER BY n.ncpgmmtrlid;"
                .Parameters.Add("@NCId", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With


        End With
    End Sub
    Private Sub setUpCurrentParts()
        Da_currentPgmParts = Machine.getDBLink.getMySqlDataAdopter
        With Da_currentPgmParts

            With .SelectCommand
                .CommandText = "SELECT n1.nc_pgme_part_id, n1.`DwgName`, n1.`QtyNested`, n1.`Sheets`, n1.`TotQtyNested`, " _
                                & "n1.`QtyCut`, n1.`QtyRejected`, n1.`Remarks`, n1.`NcProgramNo` " _
                                & "FROM magodmis.ncprogram_partslist n1,magodmis.ncprograms n " _
                                & "WHERE  n.`NcId`=n1.`NcId` " _
                                & "AND n.`NcId`=@NCId;"
                .Parameters.Add("@NCId", MySql.Data.MySqlClient.MySqlDbType.VarChar)
            End With

            With .UpdateCommand
                .CommandText = "UPDATE Magodmis.Ncprogram_partslist SET QtyRejected =@QtyRejected, Remarks=@Remarks " _
                                & " WHERE NC_Pgme_part_Id=@NC_Pgme_part_Id;"
                .Parameters.Add("@QtyRejected", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "QtyRejected")
                .Parameters.Add("@Remarks", MySql.Data.MySqlClient.MySqlDbType.VarChar, 200, "Remarks")
                .Parameters.Add("@NC_Pgme_part_Id", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "NC_Pgme_Part_id")
            End With
        End With
    End Sub

    Private Sub setUpBOM()
        DA_BOMIV = Machine.getDBLink.getMySqlDataAdopter
        With DA_BOMIV
            With .SelectCommand
                .CommandText = "SELECT * FROM magodmis.`shopfloor_part _issueregister` s WHERE s.`NcId`=@NcId AND s.`Status`='Created';"
                .Parameters.Add("@NcId", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With
        End With
        DA_BOMDetails = Machine.getDBLink.getMySqlDataAdopter
        With DA_BOMDetails
            With .SelectCommand
                '  .CommandText = "SELECT * FROM magodmis.shopfloor_bom_issuedetails s WHERE s.`IV_ID`=@IV_ID;"
                .CommandText = "SELECT s.*, m.`Customer`, m.`RV_No`, m.`RV_Date`, m1.`PartId`,m1.`CustBOM_Id` " _
                    & "FROM magodmis.shopfloor_bom_issuedetails s,magodmis.material_receipt_register m, " _
                    & "magodmis.mtrl_part_receipt_details m1 WHERE s.`IV_ID` =@IV_ID AND m.`RvID`=s.`RV_Id` " _
                    & "AND m1.`Id`=s.`PartReceipt_DetailsID`;"
                .Parameters.Add("@IV_ID", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With
        End With
    End Sub

#End Region

#Region "Shift Add Close etc"
    Private Sub prepareShift()

        '***** Sorts out the Shift Serials to check for inconfirmities and small serials
        Dim Intsrl As Integer = Production1.shiftlogbook.Rows.Count
        '  Dim Counter As Integer

        For Each srl As magod.Production.shiftlogbookRow In Production1.shiftlogbook.Rows
            srl.RunningTime = srl.ToTime.Subtract(srl.FromTime).TotalMinutes
            '**** Remove Srls that are less than 2 minute and in which material has not been processed or No remarks endorsed
            If srl.Equals(Production1.shiftlogbook.Last) Then
                srl.Locked = False
            Else
                srl.Locked = True
            End If

            If srl.RunningTime < 1 And srl.QtyProcessed = 0 And srl.IsRemarksNull Then
                If Not srl.Equals(Production1.shiftlogbook.Last) Then
                    srl.Delete()

                End If

            End If

        Next
        Intsrl = 1
        Da_ShiftLog.Update(Production1.shiftlogbook)
        For Each srl As magod.Production.shiftlogbookRow In Production1.shiftlogbook.Rows
            srl.Srl = Intsrl
            Intsrl += 1
        Next
        Da_ShiftLog.Update(Production1.shiftlogbook)

        setLogTime(Machine.getCommand)

    End Sub
    Private Sub DGV_ShiftLog_CellFormatting(ByVal sender As Object, ByVal e As System.Windows.Forms.DataGridViewCellFormattingEventArgs) Handles DGV_ShiftLog.CellFormatting
        Dim dgrv As DataGridViewRow

        For Each dgrv In Me.DGV_ShiftLog.Rows
            If dgrv.Cells("Locked").Value <> 0 Then
                dgrv.DefaultCellStyle.BackColor = Color.Aqua
            End If
        Next


    End Sub
#End Region

    Private Sub DGV_Tasks_CellDoubleClick(ByVal sender As Object, ByVal e As System.Windows.Forms.DataGridViewCellEventArgs) Handles DGV_Tasks.CellDoubleClick
        Production1.shopfloor_bom_issuedetails.Clear()
        Production1.shopfloor_part__issueregister.Clear()
        Production1.ncprogrammtrlallotmentlist.Clear()

        If Me.DGV_Tasks.Rows(e.RowIndex).Cells("HasBOM").Value = True Then
            Me.DGV_TaskMtrl.Visible = False
            LoadTaskBOM()
        Else
            Me.DGV_TaskMtrl.Visible = True
            LoadTaskMtrl()
        End If
        selectedProgram = Production1.TaskProgramList.FindByNcid(Me.DGV_Tasks.Rows(e.RowIndex).Cells("Ncid").Value)
    End Sub

    Private Sub DGV_Tasks_DoubleClick(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles DGV_Tasks.DoubleClick

        'LoadTaskMtrl()
    End Sub

    Private Sub btnLoad_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnLoad.Click
        load_NcProgram()
    End Sub

    Private Sub btnMarkUsed_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnMarkUsed.Click
        If Me.DGV_PgmMtrl.SelectedRows.Count = 0 Then
            MsgBox("Select Rows To Marked as Used")
            Exit Sub
        Else
            If MsgBox("Material Once Marked as Used cannot be Used again. Are You Sure?", MsgBoxStyle.YesNo) = MsgBoxResult.No Then
                Exit Sub
            End If
        End If
        For Each dr As DataGridViewRow In Me.DGV_PgmMtrl.SelectedRows
            If Not (dr.Cells("Used").Value = True Or dr.Cells("Rejected").Value = True) Then
                dtRunningProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("NcPgmMtrlId").Value).Selected = True
            Else
                dtRunningProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("NcPgmMtrlId").Value).Selected = False
            End If
        Next
        With Machine.getCommand
            .Parameters.Clear()
            With .Parameters
                .Add("@NcPgmMtrlId", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .AddWithValue("@NCId", currentProgram.Ncid)
                .AddWithValue("@ShiftLogId", Production1.shiftlogbook.Last.ShiftLogId)
                ' .Add("@NcPgmMtrlId", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With
            .Connection.Open()
            Try
                .CommandText = "Use Magodmis;"
                .ExecuteNonQuery()

                For Each Mtrl As magod.Production.ncprogrammtrlallotmentlistRow _
                    In dtRunningProgramMaterialList.Select("Selected")
                    '***** Svae to database
                    .CommandText = "START TRANSACTION;"
                    .ExecuteNonQuery()
                    .Parameters("@NcPgmMtrlId").Value = Mtrl.NcPgmMtrlId


                    .CommandText = "UPDATE magodmis.ncprogrammtrlallotmentlist n SET n.`Used`=true WHERE n.`NcPgmMtrlId`=@NcPgmMtrlId;"
                    .ExecuteNonQuery()

                    .CommandText = "Update Magodmis.ncprograms Set Qtycut=Qtycut+1 Where NCId=@NCId;"
                    .ExecuteNonQuery()

                    .CommandText = "UPDATE magodmis.shiftlogbook s SET s.`QtyProcessed`= s.`QtyProcessed`+1 WHERE s.`ShiftLogId`=@ShiftLogId;"
                    .ExecuteNonQuery()

                    .CommandText = "COMMIT;"


                    .ExecuteNonQuery()
                    '**** Once Committed change Local Values
                    Mtrl.Used = True
                    Mtrl.AcceptChanges()
                    currentProgram.QtyCut += 1
                    currentProgram.AcceptChanges()
                    Production1.shiftlogbook.Last.QtyProcessed += 1
                    Production1.shiftlogbook.AcceptChanges()
                    dtRunningProgramMaterialList.FindByNcPgmMtrlId(Mtrl.NcPgmMtrlId).Selected = False
                    Mtrl.AcceptChanges()
                Next
                dtRunningProgramMaterialList.AcceptChanges()
                '*** update Program Parts Cut Quantity
                .CommandText = " UPDATE magodmis.ncprogram_partslist n,magodmis.ncprograms n1 " _
                             & "SET n.`QtyCut`=n1.qtycut*n.QtyNested " _
                              & "WHERE n.`Ncid`=n1.`Ncid` AND n1.`NCId`=@NCId;"

                .ExecuteNonQuery()


                .CommandText = "Use magod_machine;"
                .ExecuteNonQuery()

            Catch ex As Exception
                MsgBox(ex.Message)
                .CommandText = "ROLLBACK;"
                .ExecuteNonQuery()
                .CommandText = "Use magod_machine;"
                .ExecuteNonQuery()
            Finally

                .Connection.Close()
                .Parameters.Clear()
            End Try
            dtRunningProgramPartsList.Clear()
            Da_currentPgmParts.Fill(dtRunningProgramPartsList)
        End With


    End Sub

    Private Sub MachineLog_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load

    End Sub

    Private Sub BS_MachineTaskList_PositionChanged(ByVal sender As Object, ByVal e As System.EventArgs) Handles BS_MachineTaskList.PositionChanged
        Production1.shopfloor_bom_issuedetails.Clear()
        Production1.shopfloor_part__issueregister.Clear()
        Production1.ncprogrammtrlallotmentlist.Clear()
        If Not BS_MachineTaskList.Current Is Nothing Then

            If BS_MachineTaskList.Current.item("HasBOM") Then
                Me.DGV_TaskMtrl.Visible = False
                Me.DGV_BOM.Visible = True
                Me.Panel_BomIV.Visible = True
                Me.SplitContainer2.SplitterDistance = 0
                ' Me.SplitContainer2.SplitterWidth = 10
            Else
                Me.DGV_TaskMtrl.Visible = True
                Me.DGV_BOM.Visible = False
                Me.Panel_BomIV.Visible = False
                Me.SplitContainer2.SplitterDistance = Me.SplitContainer2.Width
                Me.SplitContainer2.SplitterWidth = 1
            End If
        End If

    End Sub

    Private Sub btnSavePartsDetails_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSavePartsDetails.Click
        BS_RunningProgramParts.EndEdit()
        Da_currentPgmParts.Update(dtRunningProgramPartsList)
    End Sub

    Private Sub btnTaskMtrl_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnTaskMtrl.Click
        '***** Load the Sheet to machine and Set Time
        If Me.DGV_PgmMtrl.CurrentRow.Cells("used").Value = True Or Me.DGV_PgmMtrl.CurrentRow.Cells("used").Value = True Then
            MsgBox("Cannot Load Material that is Used or Rejected " & vbCrLf & "ID :" & Me.DGV_PgmMtrl.CurrentRow.Cells("MtrlId").Value)
            Exit Sub
        End If
        'If BS_RunningProgramMaterial.Current.item("used") = True Then
        '    MsgBox("Cannot Load Material that is Used or Rejected " & vbCrLf & "ID :" _
        '           & BS_RunningProgramMaterial.Current.item("ShapeMtrlID"))
        '    Exit Sub
        'End If

        If MsgBox("Do you wish to Load Material ID :" & Me.DGV_PgmMtrl.CurrentRow.Cells("MtrlID").Value, MsgBoxStyle.YesNo) = MsgBoxResult.Yes Then

            Try
                'With BS_machne.Current
                '    .item("MtrlId") = bs_ProgramMtrlList.Current.item("ShapeMtrlID")
                'End With

                With Machine.getCommand
                    .CommandText = "UPDATE machine_data.machinestatus m SET m.`MtrlId`=@MtrlId, m.SheetStartTime=@SheetStartTime " _
                                    & " WHERE m.`MachineName`=@MachineName; "
                    With .Parameters
                        .Clear()
                        .AddWithValue("@MtrlId", Me.DGV_PgmMtrl.CurrentRow.Cells("MtrlId").Value)
                        .AddWithValue("@MachineName", _MachineName)
                        .AddWithValue("@SheetStartTime", Machine.getCurDate)
                    End With
                    .Connection.Open()
                    .ExecuteNonQuery()
                    .Connection.Close()
                    '***** update Local Info
                    currentMachine.MtrlID = Me.DGV_PgmMtrl.CurrentRow.Cells("MtrlId").Value
                    currentMachine.SheetStartTime = Machine.getCurDate
                    currentMachine.SheetMachineTime = 0


                End With
            Catch ex As Exception
                MsgBox(ex.Message)
            Finally

            End Try
        End If
        RefreshData()
    End Sub

    Private Sub CheckBox_UnUsed_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox_UnUsed.CheckedChanged
        If Me.CheckBox_UnUsed.Checked = True Then
            BS_RunningProgramMaterial.Filter = "Used=0"
            MsgBox("Used")
        Else
            MsgBox("All")
            BS_RunningProgramMaterial.Filter = ""
        End If
    End Sub


    Private Sub btnPrepare_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnPrepare.Click
        prepareShift()
    End Sub

    Private Sub btnSaveShiftLog_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSaveShiftLog.Click
        BS_ShiftLogBook.EndEdit()
        Da_ShiftLog.Update(Production1.shiftlogbook)
    End Sub

    Private Sub btnShiftClose_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnShiftClose.Click
        'Update and Close the Shift


        '*** On Closing of Shift
        Dim Msg As String

        Msg = "The current Shift Serial will be closed and Shift Report will be Submitted " _
                & vbCrLf & "Machine Status will be set as 'Shift Closed' and Form Closed" _
                & vbCrLf & "Do you wish to close the Shift?"
        If MsgBox(Msg, MsgBoxStyle.YesNo, "Close Shift") = MsgBoxResult.No Then
            Exit Sub
        End If
        ' Close_CurrentMachine_LogSrl()

        Close_Shift()
        MsgBox("Shift Closed")
        'Check if There is any Running Program that is handed over
        'If so Do Not Change the Program Parameters but Close the Shift End Time
        'Check if all Entries for the Shift have been edited
        'Anything Less than a minute will be Deleted Automatically and Locked
        ' The Stoppage Register and NC Program Machine Log Will be updated
        ' Check if the Part Qty for the Programs Executed have been updated
        ' Reply on action on Shift Instructions

    End Sub
    Private Sub Close_Shift()
        prepareShift()
        Production1.shiftlogbook.Last.Locked = True
        Da_ShiftLog.Update(Production1.shiftlogbook)
        With currentMachine
            .NCProgarmNo = "Shift Closed"
            .TaskNo = "100"
            .ProgramStartTime = Machine.getCurDate
            .SheetStartTime = Machine.getCurDate
            .ProgMachineTime = 0
            .SheetMachineTime = 0
            .StopID = 0
            .Process = ""
            .Mtrl_Code = "NIL"
            .MtrlID = "NIL"

        End With
        Da_Machine.Update(Production1.machinestatus)

        RefreshData()
        LoadTaskProgram(0)

    End Sub

    Private Sub ComboBox_Operator_SelectedIndexChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles ComboBox_Operator.SelectedIndexChanged

    End Sub


    Private Sub btn_MarkAsUsed_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_MarkAsUsed.Click
        '*** Check if Parts are Correctly distributed
        Dim qty As Int32 = CInt(Me.TextBox_UseSet.Text)
        Dim qtyToDistrbute As Integer
        If dtRunningAssyBOM.Rows.Count > 0 Then


            For Each part As magod.Production.cust_assy_bom_listRow In dtRunningAssyBOM.Rows
                qtyToDistrbute = qty * part.Quantity
                Dim UseNow As Int32 = dtRunningBOMDetails.Compute("Sum(UseNow)", String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
                If UseNow <> qtyToDistrbute Then
                    MsgBox("Part Quantity Mismatch ")
                    Exit Sub
                End If
            Next
        Else
            If dtRunningBOMIv.First.QtyIssued - dtRunningBOMIv.First.QtyUsed - qty < 0 Then
                MsgBox("Cannot Use More Parts than issued Quantity ")
                Exit Sub
            End If
            qtyToDistrbute = qty
            Dim UseNow As Int32 = dtRunningBOMDetails.Compute("Sum(UseNow)", Nothing)
            If UseNow <> qtyToDistrbute Then
                MsgBox("Part Quantity Mismatch ")
                Exit Sub
            End If
        End If
        If MsgBox(String.Format("Do you wish to Mark {0}  as used?", qty), MsgBoxStyle.YesNo) = MsgBoxResult.No Then
            Exit Sub
        End If
        With Machine.getCommand
            Dim cmdUpadteBOMIV As String = "UPDATE magodmis.shopfloor_bom_issuedetails s,magodmis.mtrl_part_receipt_details m " _
                                            & "Set m.QtyUsed=m.QtyUsed+@UseNow,s.QtyUsed=s.QtyUsed+@UseNow  " _
                                            & "WHERE m.`Id`=s.`PartReceipt_DetailsID` AND s.`Id`=@Id  ;"
            Dim cmdUpadteNCPartsList As String = "UPDATE magodmis.ncprogram_partslist n SET n.`QtyCut`=n.`QtyCut`+@QtyCut " _
                                            & "WHERE n.`NC_Pgme_Part_ID`=@NC_Pgme_Part_ID;"
            Dim cmdUpdateNCProgram As String = "UPDATE magodmis.ncprograms n SET n.`QtyCut`=n.`QtyCut`+@QtyCut WHERE n.`Ncid`=@Ncid"

            Dim cmdUpadteIV As String = "UPDATE magodmis.`shopfloor_part _issueregister` s SET s.`QtyUsed`= s.`QtyUsed`+@QtyCut WHERE s.`IssueID` =@IssueID;"
            With .Parameters
                .Clear()
                .AddWithValue("@NC_Pgme_Part_ID", dtRunningProgramPartsList.First.NC_Pgme_Part_ID)
                .AddWithValue("@QtyCut", CInt(TextBox_UseSet.Text))
                .AddWithValue("@Ncid", currentProgram.Ncid)
                .AddWithValue("@IssueID", dtRunningBOMIv.First.IssueID)
                .Add("@UseNow", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Add("@Id", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With

            '******* Update DB and Local Data
            Try
                .Connection.Open()
                .CommandText = "START TRANSACTION;"
                .ExecuteNonQuery()
                .CommandText = cmdUpadteBOMIV
                For Each part As magod.Production.shopfloor_bom_issuedetailsRow In dtRunningBOMDetails.Select("UseNow>0")
                    .Parameters("@UseNow").Value = part.UseNow
                    .Parameters("@Id").Value = part.Id
                    .ExecuteNonQuery()
                Next
                .CommandText = cmdUpadteNCPartsList
                .ExecuteNonQuery()
                .CommandText = cmdUpdateNCProgram
                .ExecuteNonQuery()
                .CommandText = cmdUpadteIV
                .ExecuteNonQuery()


                .CommandText = "COMMIT;"
                .ExecuteNonQuery()
                For Each part As magod.Production.shopfloor_bom_issuedetailsRow In dtRunningBOMDetails.Select("UseNow>0")
                    part.QtyUsed += part.UseNow
                    part.UseNow = 0

                Next
                dtRunningProgramPartsList.First.QtyCut += CInt(Me.TextBox_UseSet.Text)
                dtRunningBOMIv.First.QtyUsed += CInt(Me.TextBox_UseSet.Text)
                If dtRunningBOMIv.First.QtyIssued = dtRunningBOMIv.First.QtyUsed Then
                    .CommandText = "UPDATE magodmis.`shopfloor_part _issueregister` s SET s.`Status`='Closed' WHERE s.`IssueID`=@IssueID;"
                    .ExecuteNonQuery()
                    btn_MarkAsUsed.Enabled = False
                End If
                currentProgram.QtyCut += CInt(Me.TextBox_UseSet.Text)
                dtRunningProgramPartsList.AcceptChanges()
                dtRunningBOMDetails.AcceptChanges()
                dtRunningBOMIv.AcceptChanges()
                currentProgram.AcceptChanges()
            Catch ex As Exception
                .CommandText = "ROLLBACK;"
                .ExecuteNonQuery()
                MsgBox(ex.Message)
            Finally
                .Connection.Close()
                .Parameters.Clear()
            End Try

        End With

    End Sub
    Private Sub btnMtrlReject_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnMtrlReject.Click
        If Me.DGV_PgmMtrl.SelectedRows.Count = 0 Then
            MsgBox("Select Rows To Marked as Rejected")
            Exit Sub
        Else
            If MsgBox("Material Once Marked as Rejected cannot be Used again. Are You Sure?", MsgBoxStyle.YesNo) = MsgBoxResult.No Then
                Exit Sub
            End If
        End If
        For Each dr As DataGridViewRow In Me.DGV_PgmMtrl.SelectedRows
            If Not (dr.Cells("Used").Value = True Or dr.Cells("Rejected").Value = True) Then
                If (IsDBNull(dr.Cells("RejectionReason").Value) OrElse dr.Cells("RejectionReason").Value.ToString.Length = 0) Then
                    MsgBox("Give Reasons For Rejection  : " & dtRunningProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("NcPgmMtrlId").Value).ShapeMtrlID)
                    dtRunningProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("NcPgmMtrlId").Value).Selected = False
                Else
                    dtRunningProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("NcPgmMtrlId").Value).Selected = True
                End If

            Else
                dtRunningProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("NcPgmMtrlId").Value).Selected = False
            End If
        Next
        With Machine.getCommand
            .Parameters.Clear()
            With .Parameters
                .Add("@NcPgmMtrlId", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Add("@RejectionReason", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .AddWithValue("@NCId", currentProgram.Ncid)
                .AddWithValue("@ShiftLogId", Production1.shiftlogbook.Last.ShiftLogId)
                ' .Add("@NcPgmMtrlId", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With
            .Connection.Open()
            Try
                .CommandText = "Use Magodmis;"
                .ExecuteNonQuery()

                For Each Mtrl As magod.Production.ncprogrammtrlallotmentlistRow _
                    In dtRunningProgramMaterialList.Select("Selected")
                    '***** Svae to database
                    .CommandText = "START TRANSACTION;"
                    .ExecuteNonQuery()
                    .Parameters("@NcPgmMtrlId").Value = Mtrl.NcPgmMtrlId
                    .Parameters("@RejectionReason").Value = Mtrl.RejectionReason

                    .CommandText = "UPDATE magodmis.ncprogrammtrlallotmentlist n " _
                    & "SET n.`Rejected`=1, n.RejectionReason=@RejectionReason " _
                    & "WHERE n.`NcPgmMtrlId`=@NcPgmMtrlId;"
                    .ExecuteNonQuery()



                    .CommandText = "COMMIT;"


                    .ExecuteNonQuery()
                    '**** Once Committed change Local Values
                    Mtrl.Rejected = True
                    Mtrl.AcceptChanges()
                    Mtrl.Selected = False

                Next


                .CommandText = "Use magod_machine;"
                .ExecuteNonQuery()

            Catch ex As Exception
                MsgBox(ex.Message)
                .CommandText = "ROLLBACK;"
                .ExecuteNonQuery()
                .CommandText = "Use magod_machine;"
                .ExecuteNonQuery()
            Finally

                .Connection.Close()
                .Parameters.Clear()
            End Try

        End With
    End Sub
    Private Sub TextBox_UseSet_Validated(ByVal sender As Object, ByVal e As System.EventArgs) Handles TextBox_UseSet.Validated
        Dim qty As Int32 = CInt(Me.TextBox_UseSet.Text)
        Dim qtyToDistrbute As Integer
        For Each part As magod.Production.cust_assy_bom_listRow In dtRunningAssyBOM.Rows
            qtyToDistrbute = qty * part.Quantity
            For Each rv As magod.Production.shopfloor_bom_issuedetailsRow In dtRunningBOMDetails.Select(String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
                rv.UseNow = 0
            Next
            For Each rv As magod.Production.shopfloor_bom_issuedetailsRow In dtRunningBOMDetails.Select(String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
                '***** Set Qty Used to Qty if QtyUsed is Less else Qtyused as qty
                rv.UseNow = 0
                If rv.QtyIssued - rv.QtyUsed > qtyToDistrbute Then
                    rv.UseNow = qtyToDistrbute
                    qtyToDistrbute = 0
                Else
                    rv.UseNow = rv.QtyIssued - rv.QtyUsed
                    qtyToDistrbute -= rv.UseNow
                End If
                If qtyToDistrbute = 0 Then Exit For



            Next
        Next
    End Sub

    Private Sub TextBox_UseSet_Validating(ByVal sender As System.Object, ByVal e As System.ComponentModel.CancelEventArgs) Handles TextBox_UseSet.Validating
        If Not IsNumeric(Me.TextBox_UseSet) AndAlso CInt(Me.TextBox_UseSet.Text) < 1 Then
            MsgBox("Enter Positive Number")
            e.Cancel = True
            Exit Sub
        End If
        Dim qty As Int32 = CInt(Me.TextBox_UseSet.Text)
        'If qty > dtRunningBOMIv.First.QtyIssued Then
        '    MsgBox("Cannot use Quantity greater than Issued")
        '    e.Cancel = True
        '    Exit Sub
        'End If
        Dim qtyToDistrbute As Integer
        For Each part As magod.Production.cust_assy_bom_listRow In dtRunningAssyBOM.Rows
            Dim QtyUsed As Int32 = dtRunningBOMDetails.Compute("Sum(QtyUsed)", String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
            Dim QtyReturned As Int32 = dtRunningBOMDetails.Compute("Sum(QtyReturned)", String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
            qtyToDistrbute = qty * part.Quantity
            If qtyToDistrbute > dtRunningBOMIv.First.QtyIssued * part.Quantity - QtyUsed - QtyReturned Then
                MsgBox("Cannot use Quantity greater than Issued and Used/returned")
                e.Cancel = True
                Exit Sub
            End If
        Next

    End Sub

    Private Sub DGV_RunningBOMDetails_CellValidating(ByVal sender As System.Object, ByVal e As System.Windows.Forms.DataGridViewCellValidatingEventArgs) Handles DGV_RunningBOMDetails.CellValidating
        If Me.DGV_RunningBOMDetails.Columns(e.ColumnIndex).Name = "UseNow" Then
            If Me.DGV_RunningBOMDetails.Rows(e.RowIndex).Cells("QtyIssued").Value _
            < Me.DGV_RunningBOMDetails.Rows(e.RowIndex).Cells("QtyUsed").Value _
            + CInt(e.FormattedValue) Then
                MsgBox("cannot Use more than Quantity allotted")
                e.Cancel = True
                Exit Sub
            End If
        End If
    End Sub

    Private Sub setNcProgramStatus()
        'For Each dr As DataGridViewRow In DGV_Tasks.Rows
        '    If dr.Cells("Mtrl_QtyCut").Value = 0 Then
        '        dr.DefaultCellStyle.BackColor = Color.Azure
        '    ElseIf dr.Cells("Mtrl_QtyCut").Value < dr.Cells("Mtrl_QtyAllotted").Value Then

        '        dr.DefaultCellStyle.BackColor = Color.Gray
        '    ElseIf dr.Cells("Mtrl_QtyCut").Value = dr.Cells("Mtrl_QtyAllotted").Value Then
        '        dr.DefaultCellStyle.BackColor = Color.Green
        '    End If
        'Next
    End Sub

    Private Sub btn_RefreshShiftProgram_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_RefreshShiftProgram.Click
        refreshMachichineProgramList()
    End Sub
    Private Sub refreshMachichineProgramList()
        dtShiftPrograms.Clear()
        DA_ProdProgram.Fill(dtShiftPrograms)
        Dim Hours, Min As Integer
        For Each ncPgme As magod.Production.TaskProgramListRow In dtShiftPrograms.Rows
            Hours = Math.DivRem(ncPgme.EstimatedTime, 60, Min)
            ncPgme.EstmatedMachineTime = String.Format("{0} Hours {1} Min", Hours, Min)
            Hours = Math.DivRem(ncPgme.ActualTime, 60, Min)
            ncPgme.ActualMachineTime = String.Format("{0} Hours {1} Min", Hours, Min)

        Next
    End Sub


    Private Sub btnGetProgram_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnGetProgram.Click
        '***** Check if the program Exist
        ' NcPath+NcProgramNo+Ext as per machine
        If StoppageID <> 0 Or selectedProgram Is Nothing Then
            Exit Sub
        End If

        Dim NcFile As String = Machine.getMachineNCPath & _MachineName _
                            & "\" & selectedProgram.NCProgramNo & Production1.machinestatus.First.NcExtn
        Dim fileinfo As IO.FileInfo
        fileinfo = New IO.FileInfo(NcFile)
        If fileinfo.Exists Then
            Using X As New OpenFileDialog
                X.Filter = String.Format("{0}|*.{1}", UCase(Production1.machinestatus.First.NcExtn),
                                         Production1.machinestatus.First.NcExtn)


            End Using
        Else
            MsgBox(String.Format("{0} does not exist", fileinfo.FullName))
        End If



    End Sub

    Private Sub btnErrorReport_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnErrorReport.Click
        Dim X As New Form_MachineError(_MachineName, Production1.machinestatus.First._Operator)
        X.ShowDialog()
    End Sub

    Private Sub btn_Refresh_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_Refresh.Click
        reviewTasks()
        setShiftSummary()
    End Sub
#End Region

#Region "Shift Production Report Processing"
    Private dtShiftPrograms As New magod.Production.TaskProgramListDataTable
    Private dtProdProgramMaterialList As New magod.Production.ncprogrammtrlallotmentlistDataTable
    Private dtProdProgramPartsList As New magod.Production.NCProgramPartsListDataTable
    Private dtProdBOMIv As New magod.Production.shopfloor_part__issueregisterDataTable
    Private dtProdBOMDetails As New magod.Production.shopfloor_bom_issuedetailsDataTable
    Private dtProdAssyBOM As New magod.Production.cust_assy_bom_listDataTable



    Private prodProgram As magod.Production.TaskProgramListRow

    Private DA_ProdProgram, DA_ProdClosingPartsList, DA_ProdClosingMtrlList, DA_prodBOMIV, DA_prodBOMIVDetals As MySql.Data.MySqlClient.MySqlDataAdapter

    Private Sub setUpProdDA()
        DA_ProdProgram = Machine.getDBLink.getMySqlDataAdopter
        With DA_ProdProgram

            With .SelectCommand
                .CommandText = "SELECT n.*, c.cust_name FROM magodmis.ncprograms n," _
                    & "magodmis.prioritytable p,magodmis.cust_data c " _
                    & "WHERE n.`Machine` =@Machine AND (n.`PStatus`='Cutting' OR n.`PStatus`='Processing') " _
                    & "AND p.`Priority`=n.`Priority` And n.`cust_code`= c.`cust_code` " _
                    & "ORDER BY p.`Seniority`; "
                .Parameters.AddWithValue("@Machine", _MachineName)

            End With

            With .UpdateCommand
                .CommandText = "Update magodmis.NcPrograms Set  PStatus=@PStatus  " _
                    & "Where  NCId=@NCId;"
                .Parameters.Add("@NCId", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "NcId")
                .Parameters.Add("@PStatus", MySql.Data.MySqlClient.MySqlDbType.VarChar, 45, "PStatus")
            End With


        End With

        '*************  Program Parts List Setup
        DA_ProdClosingPartsList = Machine.getDBLink.getMySqlDataAdopter
        With DA_ProdClosingPartsList

            With .SelectCommand
                .CommandText = "SELECT * FROM magodmis.ncprogram_partslist n WHERE n.`NCId`=@NCId"
                .CommandText = "SELECT n1.nc_pgme_part_id, n1.`DwgName`, n1.`QtyNested`, n1.`Sheets`,  " _
                                & "n1.`QtyNested` * n1.`Sheets` as `TotQtyNested`, " _
                                   & "n1.`QtyCut`, n1.`QtyRejected`, n1.`Remarks`, n1.`NcProgramNo` " _
                                   & "FROM magodmis.ncprogram_partslist n1 WHERE n1.`NCId`=@NCId"
                .Parameters.Add("@NCId", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With

            With .UpdateCommand
                .CommandText = "UPDATE Magodmis.Ncprogram_partslist SET QtyRejected =@QtyRejected, Remarks=@Remarks " _
                                & " WHERE NC_Pgme_part_Id=@NC_Pgme_part_Id;"
                .Parameters.Add("@QtyRejected", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "QtyRejected")
                .Parameters.Add("@Remarks", MySql.Data.MySqlClient.MySqlDbType.VarChar, 200, "Remarks")
                .Parameters.Add("@NC_Pgme_part_Id", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "NC_Pgme_Part_id")
            End With
        End With

        '******* Program BOMIV and Details
        DA_prodBOMIV = Machine.getDBLink.getMySqlDataAdopter
        With DA_prodBOMIV
            With .SelectCommand
                .CommandText = "SELECT * FROM magodmis.`shopfloor_part _issueregister` s WHERE s.`NcId`=@NcId AND s.`Status`='Created';"
                .Parameters.Add("@NcId", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With
        End With
        DA_prodBOMIVDetals = Machine.getDBLink.getMySqlDataAdopter
        With DA_prodBOMIVDetals
            With .SelectCommand
                '  .CommandText = "SELECT * FROM magodmis.shopfloor_bom_issuedetails s WHERE s.`IV_ID`=@IV_ID;"
                .CommandText = "SELECT s.*, m.`Customer`, m.`RV_No`, m.`RV_Date`, m1.`PartId`,m1.`CustBOM_Id` " _
                    & "FROM magodmis.shopfloor_bom_issuedetails s,magodmis.material_receipt_register m, " _
                    & "magodmis.mtrl_part_receipt_details m1 WHERE s.`IV_ID` =@IV_ID AND m.`RvID`=s.`RV_Id` " _
                    & "AND m1.`Id`=s.`PartReceipt_DetailsID`;"
                .Parameters.Add("@IV_ID", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With
        End With
        '**************** Program Sheet Material list
        DA_ProdClosingMtrlList = Machine.getDBLink.getMySqlDataAdopter
        With DA_ProdClosingMtrlList
            With .SelectCommand
                .CommandText = "Select * From Magodmis.ncprogrammtrlallotmentlist n " _
                                & "WHERE n.`NCId`=@NCId ORDER BY n.ncpgmmtrlid;"
                .Parameters.Add("@NCId", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With
        End With
    End Sub

    Private Sub btn_LoadProdDetails_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_LoadProdDetails.Click
        dtProdProgramPartsList.Clear()
        dtProdProgramMaterialList.Clear()
        dtProdAssyBOM.Clear()
        If currentProgram.Ncid = DGV_ProdPrograms.CurrentRow.Cells("ProdNcid").Value Then
            MsgBox("Program Currently Being Processed, Use Current Program Window to update values")
            Exit Sub
        End If

        DA_ProdClosingPartsList.SelectCommand.Parameters("@NCId").Value = DGV_ProdPrograms.CurrentRow.Cells("ProdNcid").Value
        DA_ProdClosingPartsList.Fill(dtProdProgramPartsList)
        prodProgram = dtShiftPrograms.FindByNcid(DGV_ProdPrograms.CurrentRow.Cells("ProdNcid").Value)

        If prodProgram.HasBOM Then
            Me.DGV_ProdMtrlSheets.Visible = False
            Me.DGV_ProdBOM.Visible = True
            Me.Panel_ProdBOM.Visible = True
            Me.Panel_ProdSheets.Visible = False
            DA_prodBOMIV.SelectCommand.Parameters("@NCId").Value = prodProgram.Ncid
            DA_prodBOMIV.Fill(dtProdBOMIv)
            If Not dtProdBOMIv.Rows.Count = 0 Then
                DA_BOMDetails.SelectCommand.Parameters("@IV_ID").Value = dtProdBOMIv.First.IssueID
                DA_BOMDetails.Fill(dtProdBOMDetails)
            End If
            Me.SplitContainer_Productionmaterial.SplitterDistance = 0
            '***** Load AssemblyBOM
            With Machine.getCommand
                .CommandText = "SELECT c1.* FROM magodmis.cust_assy_data c,magodmis.cust_assy_bom_list c1 " _
                                & "WHERE c.`Cust_Code`=@Cust_Code AND  c.`AssyCust_PartId`=@AssyCust_PartId " _
                                & "AND c1.`Cust_AssyId`=c.`Id`;"
                .Parameters.Clear()
                .Parameters.AddWithValue("@Cust_Code", prodProgram.Cust_Code)
                .Parameters.AddWithValue("@AssyCust_PartId", dtProdProgramPartsList.First.DwgName)
                .Connection.Open()
                dtProdAssyBOM.Load(.ExecuteReader)
                .Connection.Close()
            End With
            ' Me.SplitContainer_Material.SplitterDistance = 0
        Else
            Me.DGV_ProdMtrlSheets.Visible = True
            Me.DGV_ProdBOM.Visible = False
            Me.Panel_ProdBOM.Visible = False
            Me.Panel_ProdSheets.Visible = True

            DA_ProdClosingMtrlList.SelectCommand.Parameters("@NCId").Value = prodProgram.Ncid
            DA_ProdClosingMtrlList.Fill(dtProdProgramMaterialList)

            Me.SplitContainer_Productionmaterial.SplitterDistance = Me.SplitContainer_Productionmaterial.Width
        End If

        ' DA_ProdClosingMtrlList.SelectCommand.Parameters("@NCId").Value = DGV_ProdPrograms.CurrentRow.Cells("ProdNcid").Value

    End Sub

    Private Sub BS_ProdProgram_PositionChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles BS_ProdProgram.PositionChanged
        BS_ProdParts.EndEdit()
        DA_ProdClosingPartsList.Update(dtProdProgramPartsList)
        Me.DGV_ProdMtrlSheets.Visible = False
        Me.DGV_ProdBOM.Visible = False
        Me.Panel_ProdBOM.Visible = False
        Me.Panel_ProdSheets.Visible = False
        dtProdProgramPartsList.Clear()
        dtProdProgramMaterialList.Clear()
        dtProdBOMDetails.Clear()
        dtProdBOMIv.Clear()
        dtProdAssyBOM.Clear()
        prodProgram = Nothing
    End Sub

    Private Sub CheckBox_ProdMtrlUsed_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox_ProdMtrlUsed.CheckedChanged
        If Me.CheckBox_ProdMtrlUsed.Checked = True Then
            BS_ProgramMaterial.Filter = "Used=0"
            MsgBox("Used")
        Else
            MsgBox("All")
            BS_ProgramMaterial.Filter = ""
        End If
    End Sub

    Private Sub btn_ProdMtrlUsed_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_ProdMtrlUsed.Click
        If Me.DGV_ProdMtrlSheets.SelectedRows.Count = 0 Then
            MsgBox("Select Rows To Marked as Used")
            Exit Sub
        Else
            If MsgBox("Material Once Marked as Used cannot be Used again. Are You Sure?", MsgBoxStyle.YesNo) = MsgBoxResult.No Then
                Exit Sub
            End If
        End If
        '**** Mark Material as Used or Not used
        For Each dr As DataGridViewRow In Me.DGV_ProdMtrlSheets.SelectedRows
            If Not (dr.Cells("ProdUsed").Value = True Or dr.Cells("ProdRejected").Value = True) Then
                dtProdProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("ProdNcPgmMtrlId").Value).Selected = True
            Else
                dtProdProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("ProdNcPgmMtrlId").Value).Selected = False
            End If
        Next
        '**** Update Database Upadte Quanity Processed for Program
        With Machine.getCommand
            .Parameters.Clear()
            With .Parameters
                .Add("@NcPgmMtrlId", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .AddWithValue("@NCId", DGV_ProdPrograms.CurrentRow.Cells("ProdNcid").Value)
            End With
            .Connection.Open()
            Try
                .CommandText = "Use Magodmis;"
                .ExecuteNonQuery()

                For Each Mtrl As magod.Production.ncprogrammtrlallotmentlistRow _
                    In dtProdProgramMaterialList.Select("Selected")
                    '***** Svae to database
                    .CommandText = "START TRANSACTION;"
                    .ExecuteNonQuery()
                    .Parameters("@NcPgmMtrlId").Value = Mtrl.NcPgmMtrlId
                    .CommandText = "UPDATE magodmis.ncprogrammtrlallotmentlist n SET n.`Used`=true WHERE n.`NcPgmMtrlId`=@NcPgmMtrlId;"
                    .ExecuteNonQuery()

                    .CommandText = "Update Magodmis.ncprograms Set Qtycut=Qtycut+1 Where NCId=@NCId;"
                    .ExecuteNonQuery()


                    .CommandText = "COMMIT;"


                    .ExecuteNonQuery()
                    '**** Once Committed change Local Values
                    Mtrl.Used = True
                    Mtrl.Selected = False
                    Mtrl.AcceptChanges()
                    dtShiftPrograms.FindByNcid(DGV_ProdPrograms.CurrentRow.Cells("ProdNcid").Value).QtyCut += 1
                    dtShiftPrograms.AcceptChanges()
                Next
                '*** update Program Parts Cut Quantity
                .CommandText = " UPDATE magodmis.ncprogram_partslist n,magodmis.ncprograms n1 " _
                             & "SET n.`QtyCut`=n1.qtycut*n.QtyNested " _
                              & "WHERE n.`Ncid`=n1.`Ncid` AND n1.`NCId`=@NCId;"

                .ExecuteNonQuery()


                .CommandText = "Use magod_machine;"
                .ExecuteNonQuery()

            Catch ex As Exception
                MsgBox(ex.Message)
                .CommandText = "ROLLBACK;"
                .ExecuteNonQuery()
                .CommandText = "Use magod_machine;"
                .ExecuteNonQuery()
            Finally

                .Connection.Close()
                .Parameters.Clear()
            End Try
            dtProdProgramPartsList.Clear()
            DA_ProdClosingPartsList.Fill(dtProdProgramPartsList)
        End With

    End Sub

    Private Sub btnSaveProdParts_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSaveProdParts.Click

        BS_ProdParts.EndEdit()
        DA_ProdClosingPartsList.Update(dtProdProgramPartsList)

    End Sub

    Private Sub Button2_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Button2.Click
        If Me.DGV_ProdMtrlSheets.SelectedRows.Count = 0 Then
            MsgBox("Select Rows To Marked as Rejected")
            Exit Sub
        Else
            If MsgBox("Material Once Marked as Rejected cannot be Used again. Are You Sure?", MsgBoxStyle.YesNo) = MsgBoxResult.No Then
                Exit Sub
            End If
        End If
        For Each dr As DataGridViewRow In Me.DGV_ProdMtrlSheets.SelectedRows
            If Not (dr.Cells("ProdUsed").Value = True Or dr.Cells("ProdRejected").Value = True) Then
                If (IsDBNull(dr.Cells("ProdRejectionReason").Value) OrElse dr.Cells("ProdRejectionReason").Value.ToString.Length = 0) Then
                    MsgBox("Give Reasons For Rejection  : " & dtProdProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("ProdNcPgmMtrlId").Value).ShapeMtrlID)
                    dtProdProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("ProdNcPgmMtrlId").Value).Selected = False
                Else
                    dtProdProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("ProdNcPgmMtrlId").Value).Selected = True
                End If

            Else
                dtProdProgramMaterialList.FindByNcPgmMtrlId(dr.Cells("ProdNcPgmMtrlId").Value).Selected = False
            End If
        Next
        With Machine.getCommand
            .Parameters.Clear()
            With .Parameters
                .Add("@NcPgmMtrlId", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Add("@RejectionReason", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .AddWithValue("@NCId", DGV_ProdPrograms.CurrentRow.Cells("ProdNcid").Value)

            End With
            .Connection.Open()
            Try
                .CommandText = "Use Magodmis;"
                .ExecuteNonQuery()

                For Each Mtrl As magod.Production.ncprogrammtrlallotmentlistRow _
                    In dtProdProgramMaterialList.Select("Selected")
                    '***** Svae to database
                    .CommandText = "START TRANSACTION;"
                    .ExecuteNonQuery()
                    .Parameters("@NcPgmMtrlId").Value = Mtrl.NcPgmMtrlId
                    .Parameters("@RejectionReason").Value = Mtrl.RejectionReason

                    .CommandText = "UPDATE magodmis.ncprogrammtrlallotmentlist n " _
                    & "SET n.`Rejected`=1, n.RejectionReason=@RejectionReason " _
                    & "WHERE n.`NcPgmMtrlId`=@NcPgmMtrlId;"
                    .ExecuteNonQuery()



                    .CommandText = "COMMIT;"


                    .ExecuteNonQuery()
                    '**** Once Committed change Local Values
                    Mtrl.Rejected = True
                    Mtrl.AcceptChanges()
                    Mtrl.Selected = False

                Next


                .CommandText = "Use magod_machine;"
                .ExecuteNonQuery()

            Catch ex As Exception
                MsgBox(ex.Message)
                .CommandText = "ROLLBACK;"
                .ExecuteNonQuery()
                .CommandText = "Use magod_machine;"
                .ExecuteNonQuery()
            Finally

                .Connection.Close()
                .Parameters.Clear()
            End Try

        End With
    End Sub

    Private Sub Btn_ProdMarcked_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Btn_ProdMarcked.Click
        '*** Check if Parts are Correctly distributed
        Dim qty As Int32 = CInt(Me.TextBox_ProdSetsIssued.Text)
        Dim qtyToDistrbute As Integer
        For Each part As magod.Production.cust_assy_bom_listRow In dtProdAssyBOM.Rows
            qtyToDistrbute = qty * part.Quantity
            Dim UseNow As Int32 = dtProdBOMDetails.Compute("Sum(UseNow)", String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
            If UseNow <> qtyToDistrbute Then
                MsgBox("Part Quantity Mismatch ")
                Exit Sub
            End If
        Next

        If dtProdAssyBOM.Rows.Count > 0 Then


            For Each part As magod.Production.cust_assy_bom_listRow In dtProdAssyBOM.Rows
                qtyToDistrbute = qty * part.Quantity
                Dim UseNow As Int32 = dtProdBOMDetails.Compute("Sum(UseNow)", String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
                If UseNow <> qtyToDistrbute Then
                    MsgBox("Part Quantity Mismatch ")
                    Exit Sub
                End If
            Next
        Else
            If dtProdBOMIv.First.QtyIssued - dtProdBOMIv.First.QtyUsed - qty < 0 Then
                MsgBox("Cannot Use More Parts than issued Quantity")
                Exit Sub
            End If
            qtyToDistrbute = qty
            Dim UseNow As Int32 = dtProdBOMDetails.Compute("Sum(UseNow)", Nothing)
            If UseNow <> qtyToDistrbute Then
                MsgBox("Part Quantity Mismatch ")
                Exit Sub
            End If
        End If
        With Machine.getCommand
            Dim cmdUpadteBOMIV As String = "UPDATE magodmis.shopfloor_bom_issuedetails s,magodmis.mtrl_part_receipt_details m " _
                                            & "Set m.QtyUsed=m.QtyUsed+@UseNow,s.QtyUsed=s.QtyUsed+@UseNow  " _
                                            & "WHERE m.`Id`=s.`PartReceipt_DetailsID` AND s.`Id`=@Id  ;"
            Dim cmdUpadteNCPartsList As String = "UPDATE magodmis.ncprogram_partslist n SET n.`QtyCut`=n.`QtyCut`+@QtyCut " _
                                            & "WHERE n.`NC_Pgme_Part_ID`=@NC_Pgme_Part_ID;"
            Dim cmdUpdateNCProgram As String = "UPDATE magodmis.ncprograms n SET n.`QtyCut`=n.`QtyCut`+@QtyCut WHERE n.`Ncid`=@Ncid"

            Dim cmdUpadteIV As String = "UPDATE magodmis.`shopfloor_part _issueregister` s SET s.`QtyUsed`= s.`QtyUsed`+@QtyCut WHERE s.`IssueID` =@IssueID;"
            With .Parameters
                .Clear()
                .AddWithValue("@NC_Pgme_Part_ID", dtProdProgramPartsList.First.NC_Pgme_Part_ID)
                .AddWithValue("@QtyCut", CInt(TextBox_ProdSetsIssued.Text))
                .AddWithValue("@Ncid", prodProgram.Ncid)
                .AddWithValue("@IssueID", dtProdBOMIv.First.IssueID)
                .Add("@UseNow", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Add("@Id", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With

            '******* Update DB and Local Data
            Try
                .Connection.Open()
                .CommandText = "START TRANSACTION;"
                .ExecuteNonQuery()
                .CommandText = cmdUpadteBOMIV
                For Each part As magod.Production.shopfloor_bom_issuedetailsRow In dtProdBOMDetails.Select("UseNow>0")
                    .Parameters("@UseNow").Value = part.UseNow
                    .Parameters("@Id").Value = part.Id
                    .ExecuteNonQuery()
                Next
                .CommandText = cmdUpadteNCPartsList
                .ExecuteNonQuery()
                .CommandText = cmdUpdateNCProgram
                .ExecuteNonQuery()
                .CommandText = cmdUpadteIV
                .ExecuteNonQuery()


                .CommandText = "COMMIT;"
                .ExecuteNonQuery()
                For Each part As magod.Production.shopfloor_bom_issuedetailsRow In dtProdBOMDetails.Select("UseNow>0")
                    part.QtyUsed += part.UseNow
                    part.UseNow = 0

                Next
                dtProdProgramPartsList.First.QtyCut += CInt(qty)
                dtProdBOMIv.First.QtyUsed += CInt(qty)
                If dtProdBOMIv.First.QtyIssued = dtProdBOMIv.First.QtyUsed Then
                    .CommandText = "UPDATE magodmis.`shopfloor_part _issueregister` s SET s.`Status`='Closed' WHERE s.`IssueID`=@IssueID;"
                    .ExecuteNonQuery()
                End If
                prodProgram.QtyCut += CInt(qty)
                prodProgram.AcceptChanges()
                dtProdBOMDetails.AcceptChanges()
                dtProdBOMIv.AcceptChanges()
                Me.TextBox_ProdSetsIssued.Text = 0
                MsgBox("Material Parts Used")

            Catch ex As Exception
                .CommandText = "ROLLBACK;"
                .ExecuteNonQuery()
                MsgBox(ex.Message)
            Finally
                .Connection.Close()
                .Parameters.Clear()
            End Try

        End With
    End Sub

    Private Sub TextBox_ProdSetsIssued_Validated(ByVal sender As Object, ByVal e As System.EventArgs) Handles TextBox_ProdSetsIssued.Validated
        If Not IsNumeric(Me.TextBox_ProdSetsIssued.Text) OrElse CInt(Me.TextBox_ProdSetsIssued.Text) < 1 Then
            Exit Sub
        End If

        Dim qty As Int32 = CInt(Me.TextBox_ProdSetsIssued.Text)
        Dim qtyToDistrbute As Integer
        For Each part As magod.Production.cust_assy_bom_listRow In dtProdAssyBOM.Rows
            qtyToDistrbute = qty * part.Quantity
            For Each rv As magod.Production.shopfloor_bom_issuedetailsRow In dtProdBOMDetails.Select(String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
                rv.UseNow = 0
            Next
            For Each rv As magod.Production.shopfloor_bom_issuedetailsRow In dtProdBOMDetails.Select(String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
                '***** Set Qty Used to Qty if QtyUsed is Less else Qtyused as qty
                rv.UseNow = 0
                If rv.QtyIssued - rv.QtyUsed - rv.QtyReturned > qtyToDistrbute Then
                    rv.UseNow = qtyToDistrbute
                    qtyToDistrbute = 0
                Else
                    rv.UseNow = rv.QtyIssued - rv.QtyUsed - rv.QtyReturned
                    qtyToDistrbute -= rv.UseNow
                End If
                If qtyToDistrbute = 0 Then Exit For



            Next
        Next
    End Sub

    Private Sub TextBox_ProdSetsIssued_Validating(ByVal sender As System.Object, ByVal e As System.ComponentModel.CancelEventArgs) Handles TextBox_ProdSetsIssued.Validating
        If Not IsNumeric(Me.TextBox_ProdSetsIssued.Text) OrElse CInt(Me.TextBox_ProdSetsIssued.Text) < 1 Then
            MsgBox("Enter Positive Number")
            ' e.Cancel = True
            Exit Sub
        End If
        Dim qty As Int32 = CInt(Me.TextBox_ProdSetsIssued.Text)

        Dim qtyToDistrbute As Integer
        For Each part As magod.Production.cust_assy_bom_listRow In dtProdAssyBOM.Rows
            Dim QtyUsed As Int32 = dtProdBOMDetails.Compute("Sum(QtyUsed)", String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
            Dim QtyReturned As Int32 = dtProdBOMDetails.Compute("Sum(QtyReturned)", String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
            qtyToDistrbute = qty * part.Quantity
            If qtyToDistrbute > dtProdBOMIv.First.QtyIssued * part.Quantity - QtyUsed - QtyReturned Then
                MsgBox("Cannot use Quantity greater than Issued and Used/returned")
                e.Cancel = True
                Exit Sub
            End If
        Next
    End Sub

    Private Sub btn_MarkAsReturned_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_MarkAsReturned.Click
        '*** Check if Parts are Correctly distributed
        Dim qty As Int32 = CInt(Me.TextBox_ProdSetsIssued.Text)
        Dim qtyToReturn As Integer
        If dtProdAssyBOM.Rows.Count > 0 Then
            For Each part As magod.Production.cust_assy_bom_listRow In dtProdAssyBOM.Rows
                qtyToReturn = qty * part.Quantity
                Dim UseNow As Int32 = dtProdBOMDetails.Compute("Sum(UseNow)", String.Format("CustBOM_Id={0}", part.Cust_BOM_ListId))
                If UseNow <> qtyToReturn Then
                    MsgBox("Part Quantity Mismatch ")
                    Exit Sub
                End If
            Next
        Else
            If dtProdBOMIv.First.QtyIssued - dtProdBOMIv.First.QtyUsed - qty < 0 Then
                MsgBox("Cannot Return More Parts than issued Quantity less Qty Used")
                Exit Sub
            End If
            qtyToReturn = qty
            Dim UseNow As Int32 = dtProdBOMDetails.Compute("Sum(UseNow)", Nothing)
            If UseNow <> qtyToReturn Then
                MsgBox("Part Quantity Mismatch ")
                Exit Sub
            End If

        End If

        With Machine.getCommand
            '*** Material Being returned should be accepted by Material Issuer to change status to closed
            '*** Increment Material Returned line in ISSUE details
            Dim cmdUpadteBOMIV As String = "UPDATE magodmis.shopfloor_bom_issuedetails s " _
                                           & "Set s.QtyReturned=s.QtyReturned+@UseNow  " _
                                           & "WHERE  s.`Id`=@Id  ;"

            '**** Increment the Returned Item in IV Register
            Dim cmdUpadteIV As String = "UPDATE magodmis.`shopfloor_part _issueregister` s SET s.`QtyReturned`= s.`QtyReturned`+@QtyReturned WHERE s.`IssueID` =@IssueID;"
            With .Parameters
                .Clear()
                .AddWithValue("@QtyReturned", qty)
                .AddWithValue("@IssueID", dtProdBOMIv.First.IssueID)
                .Add("@UseNow", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Add("@Id", MySql.Data.MySqlClient.MySqlDbType.Int32)
            End With

            Try
                .Connection.Open()
                .CommandText = "START TRANSACTION;"
                .ExecuteNonQuery()
                .CommandText = cmdUpadteBOMIV
                For Each part As magod.Production.shopfloor_bom_issuedetailsRow In dtProdBOMDetails.Select("UseNow>0")
                    .Parameters("@UseNow").Value = part.UseNow
                    .Parameters("@Id").Value = part.Id
                    .ExecuteNonQuery()
                Next

                .CommandText = cmdUpadteIV
                .ExecuteNonQuery()


                .CommandText = "COMMIT;"
                .ExecuteNonQuery()
                For Each part As magod.Production.shopfloor_bom_issuedetailsRow In dtProdBOMDetails.Select("UseNow>0")
                    part.QtyReturned += part.UseNow
                    part.UseNow = 0

                Next

                dtProdBOMIv.First.QtyReturned += CInt(qty)

                If dtProdBOMIv.First.QtyIssued = dtProdBOMIv.First.QtyUsed Then
                    .CommandText = "UPDATE magodmis.`shopfloor_part _issueregister` s SET s.`Status`='Closed' WHERE s.`IssueID`=@IssueID;"
                    .ExecuteNonQuery()
                    dtProdBOMIv.First.Status = "Closed"
                End If

                dtProdBOMDetails.AcceptChanges()
                dtProdBOMIv.AcceptChanges()
                Me.TextBox_ProdSetsIssued.Text = 0
                MsgBox("Material Parts Returned")


            Catch ex As Exception
                .CommandText = "ROLLBACK;"
                .ExecuteNonQuery()
                MsgBox(ex.Message)
            Finally
                .Connection.Close()
                .Parameters.Clear()
            End Try
        End With

    End Sub


    Private Sub btnChangeProgramStatus_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnChangeProgramStatus.Click
        '**** Condition For Changing Status to Completed
        '*** All Sheets allotted must be eiter used or rejected
        '*** All Parts to be produced should be produced
        If prodProgram Is Nothing Then
            MsgBox("Load the Program to Close")
            Exit Sub
        End If
        If prodProgram.HasBOM Then
            If dtProdBOMIv.Rows.Count > 0 Then
                MsgBox("Either Mark the material allotted as used or rejected before changing status to completed", MsgBoxStyle.OkOnly)
                Exit Sub
            End If

        Else
            If Not CheckProgramMaterial("Completed") = "Completed" Then
                MsgBox("Either Mark the material allotted as used or rejected before changing status to completed", MsgBoxStyle.OkOnly)
                Exit Sub
            End If

        End If

        For Each part As magod.Production.NCProgramPartsListRow In dtProdProgramPartsList
            If part.TotQtyNested > part.QtyCut + part.QtyRejected Then
                If MsgBox(String.Format("{0} : Complete Qauantity Not Cut. Proceed?", part.DwgName), MsgBoxStyle.YesNo) = MsgBoxResult.No Then
                    Exit Sub
                End If
            End If
        Next



        If MsgBox("Do you want to change Status of Program to Completed", MsgBoxStyle.YesNo) = MsgBoxResult.No Then
            Exit Sub
        End If

        prodProgram.PStatus = "Completed"
        DA_ProdProgram.Update(dtShiftPrograms)
        dtShiftPrograms.Clear()
        DA_ProdProgram.Fill(dtShiftPrograms)

    End Sub

#End Region

    Private Sub setShiftSummary()
        Dim cmdTxt As New System.Text.StringBuilder
        With cmdTxt
            .Append("SELECT n.`Operation` as Head,Sum(Timestampdiff(MINUTE,s.`FromTime`, s.`ToTime`)) as TimeinMin ")
            .Append("FROM magodmis.shiftlogbook s,magodmis.ncprograms n ")
            .Append("WHERE s.`ShiftID`=@ShiftID AND s.`TaskNo` not like '100' AND n.`NCProgramNo`=s.`Program` ")
            .Append("GROUP BY s.`ShiftID`, n.`Operation` ")
            .Append("UNION ")
            .Append("SELECT  s.`StoppageReason`  as Head,Sum(Timestampdiff(MINUTE,s.`FromTime`, s.`ToTime`)) as TimeinMin ")
            .Append("FROM magodmis.shiftstoppagelist s,magod_production.stoppagereasonlist s1 WHERE s.`ShiftID`=@ShiftID ")
            .Append("AND s1.`StoppageID`= s.`StoppageID` GROUP BY s.`StoppageReason`;")

        End With
        With Machine.getCommand
            .CommandText = cmdTxt.ToString
            .Parameters.Clear()
            .Parameters.AddWithValue("@ShiftID", intShiftId)
            .Connection.Open()
            Dim dt As New DataTable
            dt.Load(.ExecuteReader)
            .Connection.Close()
            dt.Columns.Add(New DataColumn("MachineTime"))
            For Each dr As DataRow In dt.Rows
                dr.Item("MachineTime") = getHourMin(dr.Item("TimeinMin"))
            Next
            DGV_ShiftSummary.DataSource = dt
        End With
    End Sub

    Private Sub btn_ShowDxf_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_ShowDxf.Click
        If BS_RunningProgramParts.Count > 0 Then
            '**** get the Drawing Name
            '**** get the OrderNo
            Dim dxfName As String = BS_RunningProgramParts.Current.Item("DwgName")
            Dim OrderNo As String
            With Machine.getCommand
                .CommandText = " SELECT o.`Order_No` FROM magodmis.ncprograms n, magodmis.nc_task_list n1, " _
                & "magodmis.orderschedule o WHERE n1.`NcTaskId`=n.`NcTaskId` AND o.`ScheduleId`=n1.`ScheduleID` " _
                & "AND n.`Ncid`=@Ncid;"
                .Parameters.Clear()
                .Parameters.AddWithValue("@Ncid", BS_RunningProgram.Current.Item("NcId"))
                .Connection.Open()
                OrderNo = .ExecuteScalar
                .Connection.Close()
            End With
            dxfName = String.Format("{0}\{1}\DXF\{2}.dxf", Machine.getWOPath, OrderNo, BS_RunningProgramParts.Current.Item("DwgName"))
            Console.WriteLine(dxfName)
            Using X As New magod.dxf.MagodDxfViwer(dxfName)
                X.ShowDialog()
            End Using

        End If
    End Sub


    Private Sub btn_showProddxf_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_showProddxf.Click
        If BS_ProdParts.Count > 0 Then
            '**** get the Drawing Name
            '**** get the OrderNo
            Dim dxfName As String = BS_ProdParts.Current.Item("DwgName")
            Dim OrderNo As String
            With Machine.getCommand
                .CommandText = " SELECT o.`Order_No` FROM magodmis.ncprograms n, magodmis.nc_task_list n1, " _
                & "magodmis.orderschedule o WHERE n1.`NcTaskId`=n.`NcTaskId` AND o.`ScheduleId`=n1.`ScheduleID` " _
                & "AND n.`Ncid`=@Ncid;"
                .Parameters.Clear()
                .Parameters.AddWithValue("@Ncid", BS_ProdProgram.Current.Item("NcId"))
                .Connection.Open()
                OrderNo = .ExecuteScalar
                .Connection.Close()
            End With
            dxfName = String.Format("{0}\{1}\DXF\{2}.dxf", Machine.getWOPath, OrderNo, BS_ProdParts.Current.Item("DwgName"))
            ' Console.WriteLine(dxfName)
            Using X As New magod.dxf.MagodDxfViwer(dxfName)
                X.ShowDialog()
            End Using

        End If
    End Sub
End Class