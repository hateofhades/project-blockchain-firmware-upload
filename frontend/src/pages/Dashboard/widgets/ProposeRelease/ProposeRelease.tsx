import { faArrowRotateRight, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Label } from 'components/Label';
import { OutputContainer } from 'components/OutputContainer';
import { MvxButton, useGetNetworkConfig } from 'lib';
import { ItemsIdentifiersEnum } from 'pages/Dashboard/dashboard.types';
import { useGetSlots } from '../GetSlots/hooks/useGetSlots';
import { useProposeRelease } from './hooks';

// prettier-ignore
const styles = {
    container: 'propose-release flex flex-col gap-4',
    form: 'propose-form flex flex-col gap-3',
    inputsRow: 'inputs-row grid grid-cols-1 md:grid-cols-3 gap-3',
    inputContainer: 'input-container flex flex-col gap-1',
    input: 'input bg-primary/60 border border-secondary rounded-md px-3 py-2 text-sm text-primary focus:outline-none focus:border-primary transition-all duration-200',
    actions: 'actions flex gap-2 flex-wrap',
    actionButtonContent: 'action-button-content flex items-center gap-2 text-sm font-normal',
    helper: 'helper text-secondary text-xs',
    empty: 'text-secondary'
} satisfies Record<string, string>;

export const ProposeRelease = () => {
    const { proposeRelease, isSubmitting } = useProposeRelease();
    const { refetch, isLoading } = useGetSlots();
    const { network } = useGetNetworkConfig();

    const [version, setVersion] = useState('');
    const [hash, setHash] = useState('');
    const [url, setUrl] = useState('');
    const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);

    const canSubmit = useMemo(
        () => version.trim() !== '' && hash.trim() !== '' && url.trim() !== '' && !isSubmitting,
        [version, hash, url, isSubmitting]
    );

    useEffect(() => {
        if (lastSubmitted) {
            const timer = setTimeout(() => setLastSubmitted(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [lastSubmitted]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) {
            return;
        }

        const sessionId = await proposeRelease(version.trim(), hash.trim(), url.trim());
        if (sessionId) {
            setLastSubmitted(sessionId);
            setVersion('');
            setHash('');
            setUrl('');
            await refetch();
        }
    };

    return (
        <div id={ItemsIdentifiersEnum.proposeRelease} className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputsRow}>
                    <div className={styles.inputContainer}>
                        <Label>Version</Label>
                        <input
                            className={styles.input}
                            placeholder='1.0.0'
                            value={version}
                            onChange={(e) => setVersion(e.currentTarget.value)}
                        />
                        <span className={styles.helper}>String, e.g. 1.0.0</span>
                    </div>

                    <div className={styles.inputContainer}>
                        <Label>Hash</Label>
                        <input
                            className={styles.input}
                            placeholder='abc123...'
                            value={hash}
                            onChange={(e) => setHash(e.currentTarget.value)}
                        />
                        <span className={styles.helper}>Arbitrary string hash</span>
                    </div>

                    <div className={styles.inputContainer}>
                        <Label>URL</Label>
                        <input
                            className={styles.input}
                            placeholder='https://...'
                            value={url}
                            onChange={(e) => setUrl(e.currentTarget.value)}
                        />
                        <span className={styles.helper}>Release URL</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <MvxButton
                        size='small'
                        type='submit'
                        disabled={!canSubmit}
                        data-testid='proposeReleaseBtn'
                        onClick={handleSubmit}
                    >
                        <span className={styles.actionButtonContent}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                            <span>{isSubmitting ? 'Proposing…' : 'Propose'}</span>
                        </span>
                    </MvxButton>

                    <MvxButton
                        size='small'
                        type='button'
                        onClick={() => {
                            setVersion('');
                            setHash('');
                            setUrl('');
                        }}
                        disabled={isSubmitting}
                    >
                        <span className={styles.actionButtonContent}>
                            <FontAwesomeIcon icon={faArrowRotateRight} />
                            <span>Clear</span>
                        </span>
                    </MvxButton>
                </div>
            </form>

            <OutputContainer isLoading={isLoading}>
                {lastSubmitted ? (
                    <p className={styles.helper}>
                        Submitted session: {lastSubmitted} on {network.name}
                    </p>
                ) : (
                    <p className={styles.empty}>Fill in version, hash, and URL to propose a release.</p>
                )}
            </OutputContainer>
        </div>
    );
};
