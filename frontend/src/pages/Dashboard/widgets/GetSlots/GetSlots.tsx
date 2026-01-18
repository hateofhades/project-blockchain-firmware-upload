import { faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { Label } from 'components/Label';
import { OutputContainer } from 'components/OutputContainer';
import {
    ACCOUNTS_ENDPOINT,
    MvxButton,
    MvxCopyButton,
    MvxDataWithExplorerLink,
    useGetNetworkConfig
} from 'lib';
import { ItemsIdentifiersEnum } from 'pages/Dashboard/dashboard.types';
import { SlotStatus, useGetSlots } from './hooks';

// prettier-ignore
const styles = {
    container: 'get-slots flex flex-col gap-4',
    actions: 'get-slots-actions flex justify-end',
    actionButtonContent: 'action-button-content flex items-center gap-2 text-sm font-normal',
    list: 'get-slots-list flex flex-col gap-4',
    slotCard: 'slot-card flex flex-col gap-3 bg-primary/50 border border-secondary rounded-lg p-4',
    slotHeader: 'slot-header flex justify-between items-start gap-2',
    slotTitle: 'slot-title flex flex-col gap-1',
    version: 'version text-lg font-medium text-primary',
    statusBadge: 'status-badge px-2 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-md border',
    statusProposed: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    statusApproved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    statusRejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    statusUnknown: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    slotRow: 'slot-row flex flex-col gap-1',
    slotValue: 'slot-value text-primary break-words',
    slotValueWithAction: 'slot-value-with-action flex items-center gap-2 flex-wrap',
    mono: 'mono font-mono text-xs break-all',
    address: 'address text-primary break-all flex items-center gap-2',
    approvals: 'approvals flex flex-col gap-1',
    empty: 'empty text-secondary',
    error: 'error text-red-400',
    url: 'url underline underline-offset-4 decoration-dotted break-words'
} satisfies Record<string, string>;

const statusClassMap: Record<SlotStatus, string> = {
    PROPOSED: `${styles.statusBadge} ${styles.statusProposed}`,
    APPROVED: `${styles.statusBadge} ${styles.statusApproved}`,
    REJECTED: `${styles.statusBadge} ${styles.statusRejected}`,
    UNKNOWN: `${styles.statusBadge} ${styles.statusUnknown}`
};

export const GetSlots = () => {
    const { network } = useGetNetworkConfig();
    const { slots, isLoading, error, refetch } = useGetSlots();
    const explorerAddress = network.explorerAddress;

    return (
        <div id={ItemsIdentifiersEnum.getSlots} className={styles.container}>
            <div className={styles.actions}>
                <MvxButton size='small' onClick={refetch} disabled={isLoading}>
                    <span className={styles.actionButtonContent}>
                        <FontAwesomeIcon icon={faArrowRotateRight} />
                        <span>Refresh</span>
                    </span>
                </MvxButton>
            </div>

            <OutputContainer isLoading={isLoading}>
                {error && <p className={styles.error}>{error}</p>}

                {!error && slots.length === 0 && !isLoading && (
                    <p className={styles.empty}>No slots returned by the contract.</p>
                )}

                {!error && slots.length > 0 && (
                    <div className={styles.list}>
                        {slots.map((slot) => (
                            <div
                                key={`${slot.version}-${slot.hash}`}
                                className={styles.slotCard}
                                data-testid='contract-slot-card'
                            >
                                <div className={styles.slotHeader}>
                                    <div className={styles.slotTitle}>
                                        <Label>Version</Label>
                                        <span className={styles.version}>{slot.version || 'N/A'}</span>
                                    </div>

                                    <span className={classNames(statusClassMap[slot.status])}>
                                        {slot.status}
                                    </span>
                                </div>

                                <div className={styles.slotRow}>
                                    <Label>Hash</Label>
                                    <div className={styles.slotValueWithAction}>
                                        <span className={styles.mono}>{slot.hash || 'N/A'}</span>
                                        {slot.hash && <MvxCopyButton text={slot.hash} />}
                                    </div>
                                </div>

                                <div className={styles.slotRow}>
                                    <Label>URL</Label>
                                    <span className={styles.url}>{slot.url || 'N/A'}</span>
                                </div>

                                <div className={styles.slotRow}>
                                    <Label>Creator</Label>
                                    {slot.creator ? (
                                        <MvxDataWithExplorerLink
                                            data={slot.creator}
                                            withTooltip={true}
                                            className={styles.address}
                                            explorerLink={`${explorerAddress}/${ACCOUNTS_ENDPOINT}/${slot.creator}`}
                                        />
                                    ) : (
                                        <span className={styles.empty}>N/A</span>
                                    )}
                                </div>

                                <div className={styles.slotRow}>
                                    <Label>Approvals</Label>
                                    {slot.approvals.length ? (
                                        <div className={styles.approvals}>
                                            {slot.approvals.map((approval) => (
                                                <MvxDataWithExplorerLink
                                                    key={approval}
                                                    data={approval}
                                                    withTooltip={true}
                                                    className={styles.address}
                                                    explorerLink={`${explorerAddress}/${ACCOUNTS_ENDPOINT}/${approval}`}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <span className={styles.empty}>No approvals yet</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </OutputContainer>
        </div>
    );
};
