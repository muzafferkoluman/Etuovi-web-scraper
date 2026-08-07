import React from 'react';
import { SearchRun } from '@koti-scout/shared';
import { Modal } from '../../components/ui/Modal';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export interface RunHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSearchName: string;
  runs: SearchRun[];
}

export const RunHistoryModal: React.FC<RunHistoryModalProps> = ({
  isOpen,
  onClose,
  savedSearchName,
  runs
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Scan History: ${savedSearchName}`} maxWidth="xl">
      <div className="space-y-4">
        {runs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No execution runs recorded yet. Click &quot;Run Now&quot; to execute a scan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {runs.map((run) => {
              const timeStr = new Date(run.startedAt).toLocaleString('fi-FI', {
                timeZone: 'Europe/Helsinki'
              });
              const isSuccess = run.status === 'SUCCESS';

              return (
                <div key={run.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{timeStr} (EET)</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        {run.totalFound} properties scanned • {run.newProperties} new • {run.priceChanges} price drops
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-800 text-sm">
                      {run.matchingProperties}
                    </span>
                    <span className="text-[10px] text-slate-400 block">matching score</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
