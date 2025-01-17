import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type useSetRecordTableDataProps = {
  recordTableId?: string;
  onEntityCountChange: (entityCount: number) => void;
};

export const useSetRecordTableData = ({
  recordTableId,
  onEntityCountChange,
}: useSetRecordTableDataProps) => {
  const { getTableRowIdsState, getNumberOfTableRowsState } =
    useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(newEntityArray: T[]) => {
        for (const entity of newEntityArray) {
          // TODO: refactor with scoped state later
          const currentEntity = snapshot
            .getLoadable(entityFieldsFamilyState(entity.id))
            .valueOrThrow();

          if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
            set(entityFieldsFamilyState(entity.id), entity);
          }
        }
        const currentRowIds = getSnapshotValue(snapshot, getTableRowIdsState());

        const entityIds = newEntityArray.map((entity) => entity.id);

        if (!isDeeplyEqual(currentRowIds, entityIds)) {
          set(getTableRowIdsState(), entityIds);
        }

        set(getNumberOfTableRowsState(), entityIds.length);
        onEntityCountChange(entityIds.length);
      },
    [getNumberOfTableRowsState, getTableRowIdsState, onEntityCountChange],
  );
};
