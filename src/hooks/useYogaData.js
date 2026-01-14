import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const addBatch = async (batchData) => {
    const { error } = await supabase.from("batches").insert([batchData]);
    if (error) throw error;
    await fetchBatches();
  };

  const updateBatch = async (id, batchData) => {
    const { error } = await supabase
      .from("batches")
      .update(batchData)
      .eq("id", id);
    if (error) throw error;
    await fetchBatches();
  };

  const deleteBatch = async (id) => {
    const { error } = await supabase.from("batches").delete().eq("id", id);
    if (error) throw error;
    await fetchBatches();
  };

  return {
    batches,
    loading,
    refreshBatches: fetchBatches,
    addBatch,
    updateBatch,
    deleteBatch,
  };
}

export function useStudents(batchId) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  const fetchStudents = useCallback(async () => {
    if (!batchId) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("batch_id", batchId)
        .order("name", { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handlePayment = async (student) => {
    setProcessingPaymentId(student.id);
    try {
      const { error: updateError } = await supabase
        .from("students")
        .update({
          payment_status: "paid",
          last_payment_date: new Date().toISOString(),
        })
        .eq("id", student.id);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase
        .from("payment_history")
        .insert([
          {
            student_id: student.id,
            amount: student.fees_amount,
            status: "paid",
          },
        ]);

      if (historyError) throw historyError;

      await fetchStudents();
    } catch (error) {
      console.error("Payment Error:", error);
      alert(error.message);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleReceiptReceived = async (studentId) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({ receipt_provided: true })
        .eq("id", studentId);

      if (error) throw error;
      await fetchStudents();
    } catch (error) {
      console.error("Receipt Error:", error);
      alert("Failed to update receipt status.");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (error) throw error;
      await fetchStudents();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete student.");
    }
  };

  // EXPORT refreshStudents HERE
  return {
    students,
    loading,
    processingPaymentId,
    refreshStudents: fetchStudents,
    handlePayment,
    handleReceiptReceived,
    handleDeleteStudent,
  };
}
