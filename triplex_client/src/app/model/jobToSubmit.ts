export interface JobToSubmit{
    SSRNA_FASTA: File | undefined;
    SSRNA_STRING: File | undefined;
    SSRNA_TRANSCRIPT_ID: string | undefined,
    DSDNA_FASTA: File | undefined;
    DSDNA_BED: File | undefined;
    DSDNA_TARGET_NAME: string | undefined;
    JOBNAME: String | undefined;
    EMAIL: String | undefined;
    
    min_len: number | undefined;
    max_len: number | undefined;
    error_rate: number | undefined;
    guanine_rate: number | undefined;
    filter_repeat: String | undefined
    consecutive_errors: number | undefined;
    SSTRAND: number | undefined;
}