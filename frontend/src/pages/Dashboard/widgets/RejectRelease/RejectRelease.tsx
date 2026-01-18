import { faArrowRotateRight, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Label } from 'components/Label';
import { OutputContainer } from 'components/OutputContainer';
import {
    ACCOUNTS_ENDPOINT,
    MvxButton,
    MvxCopyButton,
    MvxDataWithExplorerLink,
    useGetAccount,
    useGetNetworkConfig
} from 'lib';
import { ItemsIdentifiersEnum } from 'pages/Dashboard/dashboard.types';
import { SlotItemType, useGetSlots } from '../GetSlots/hooks/useGetSlots';
import { useRejectRelease } from './hooks';

// prettier-ignore
const styles = {
    container: 'reject-release flex flex-col gap-4',
    actions: 'reject-release-actions flex justify-between items-center gap-3 flex-wrap',
    select: 'reject-select bg-primary/60 border border-secondary rounded-md px-3 py-2 text-sm text-primary focus:outline-none focus:border-primary transition-all duration-200',
    selectWrapper: 'select-wrapper flex flex-col gap-2 w-full md:w-1/2',
    actionButtonContent: 'action-button-content flex items-center gap-2 text-sm font-normal',
    infoCard: 'info-card flex flex-col gap-3 bg-primary/40 border border-secondary rounded-lg p-4',
    row: 'row flex flex-col gap-1',
    label: 'info-label text-secondary text-sm',
    value: 'info-value text-primary break-words',
    valueMono: 'info-value-mono text-primary break-all font-mono text-xs',
    approvals: 'approvals flex flex-col gap-1',
    empty: 'text-secondary',
    statusBadge: 'status-badge px-2 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-md border w-fit',
    statusProposed: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
} satisfies Record<string, string>;

const statusClassMap: Record<string, string> = {
    PROPOSED: `${styles.statusBadge} ${styles.statusProposed}`
};

const buildKey = (slot: SlotItemType) => `${slot.version}-${slot.hash}`;

export const RejectRelease = () => {
    const { network } = useGetNetworkConfig();
    const { address } = useGetAccount();
    const { slots, isLoading, error, refetch } = useGetSlots();
    const { rejectRelease, isSubmitting } = useRejectRelease();

    const proposedSlots = useMemo(
        () =>
            slots.filter((slot) =>
                slot.status === 'PROPOSED' && slot.creator !== address
            ),
        [slots, address]
    );

    const [selectedVersion, setSelectedVersion] = useState<string>('');
    const selectedSlot = proposedSlots.find((slot) => slot.version === selectedVersion);

    useEffect(() => {
        if (proposedSlots.length && !selectedVersion) {
            setSelectedVersion(proposedSlots[0].version);
        }
    }, [proposedSlots, selectedVersion]);

    const handleReject = async () => {
        if (!selectedVersion) {
            return;
        }

        const sessionId = await rejectRelease(selectedVersion);

        if (sessionId) {
            await refetch();
        }
    };

    const explorerAddress = network.explorerAddress;

    return (
        <div id={ItemsIdentifiersEnum.rejectRelease} className={styles.container}>
            <div className={styles.actions}>
                <div className={styles.selectWrapper}>
                    <Label>Version to reject</Label>
                    <select
                        className={styles.select}
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.currentTarget.value)}
                        disabled={isLoading || proposedSlots.length === 0}
                    >
                        {proposedSlots.map((slot) => (
                            <option key={buildKey(slot)} value={slot.version}>
                                {slot.version}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='flex gap-2'>
                    <MvxButton size='small' onClick={refetch} disabled={isLoading || isSubmitting}>
                        <span className={styles.actionButtonContent}>
                            <FontAwesomeIcon icon={faArrowRotateRight} />
                            <span>Refresh</span>
                        </span>
                    </MvxButton>

                    <MvxButton
                        size='small'
                        onClick={handleReject}
                        disabled={!selectedVersion || isSubmitting}
                        data-testid='rejectReleaseBtn'
                    >
                        <span className={styles.actionButtonContent}>
                            <FontAwesomeIcon icon={faBan} />
                            <span>{isSubmitting ? 'Rejecting…' : 'Reject'}</span>
                        </span>
                    </MvxButton>
                </div>
            </div>

            <OutputContainer isLoading={isLoading}>
                {error && <p className={styles.empty}>{error}</p>}
                {!error && proposedSlots.length === 0 && !isLoading && (
                    <p className={styles.empty}>No proposed releases to reject.</p>
                )}

                {!error && selectedSlot && (
                    <div className={styles.infoCard} data-testid='rejectReleaseDetails'>
                        <div className='flex items-start justify-between gap-2'>
                            <div className={styles.row}>
                                <Label>Version</Label>
                                <span className={styles.value}>{selectedSlot.version}</span>
                            </div>

                            <span className={classNames(statusClassMap[selectedSlot.status])}>
                                {selectedSlot.status}
                            </span>
                        </div>

                        <div className={styles.row}>
                            <Label>Hash</Label>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <span className={styles.valueMono}>{selectedSlot.hash || 'N/A'}</span>
                                {selectedSlot.hash && <MvxCopyButton text={selectedSlot.hash} />}
                            </div>
                        </div>

                        <div className={styles.row}>
                            <Label>URL</Label>
                            <span className={styles.value}>{selectedSlot.url || 'N/A'}</span>
                        </div>

                        <div className={styles.row}>
                            <Label>Creator</Label>
                            {selectedSlot.creator ? (
                                <MvxDataWithExplorerLink
                                    data={selectedSlot.creator}
                                    withTooltip={true}
                                    explorerLink={`${explorerAddress}/${ACCOUNTS_ENDPOINT}/${selectedSlot.creator}`}
                                />
                            ) : (
                                <span className={styles.empty}>N/A</span>
                            )}
                        </div>

                        <div className={styles.row}>
                            <Label>Approvals</Label>
                            {selectedSlot.approvals && selectedSlot.approvals.length > 0 ? (
                                <div className={styles.approvals}>
                                    {selectedSlot.approvals.map((approval) => (
                                        <MvxDataWithExplorerLink
                                            key={approval}
                                            data={approval}
                                            withTooltip={true}
                                            explorerLink={`${explorerAddress}/${ACCOUNTS_ENDPOINT}/${approval}`}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <span className={styles.empty}>No approvals yet</span>
                            )}
                        </div>
                    </div>
                )}
            </OutputContainer>
        </div>
    );
};
