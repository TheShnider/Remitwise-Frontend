import { Contract, scValToNative, nativeToScVal } from "@stellar/stellar-sdk";
import rpc from "@stellar/stellar-sdk";
import { getServer, getNetworkPassphrase } from "@/lib/soroban/client";
import { resolveContractId } from "./network-resolution";

const server = getServer();

function getContractId(): string {
  return resolveContractId("SAVINGS_GOALS");
}

function getContract(): Contract {
  return new Contract(getContractId());
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: number;
  locked: boolean;
}

function mapToGoal(id: string, rawData: any): SavingsGoal {
  return {
    id,
    name: rawData.name?.toString() || "Unnamed Goal",
    targetAmount: Number(rawData.target_amount) || 0,
    currentAmount: Number(rawData.current_amount) || 0,
    targetDate: Number(rawData.target_date) || 0,
    locked: !!rawData.locked,
  };
}

export async function getGoal(goalId: string): Promise<SavingsGoal | null> {
  const contractId = getContractId();
  const result = await server.getContractData(
    contractId,
    nativeToScVal(goalId),
    rpc.Durability.Persistent
  );

  if (!result) return null;

  const scVal = result.val.contractData().val();

  return mapToGoal(goalId, scValToNative(scVal));
}

export async function getAllGoals(owner: string): Promise<SavingsGoal[]> {
  const contract = getContract();
  const operation = contract.call("get_all_goals", nativeToScVal(owner));

  const response = await server.simulateTransaction(operation as any);

  if (!("result" in response)) {
    console.error("Simulation failed:", response);
    return [];
  }

  const result = response.result;

  if (!result || !result.retval) {
    return [];
  }

  const rawGoals = scValToNative(result.retval);

  return Object.entries(rawGoals).map(([id, data]) => mapToGoal(id, data));
}

export async function isGoalCompleted(goalId: string): Promise<boolean> {
  const goal = await getGoal(goalId);

  if (!goal) return false;

  return goal.currentAmount >= goal.targetAmount;
}

// Re-export resolved passphrase for callers that need it when signing transactions.
export { getNetworkPassphrase };
