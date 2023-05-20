export interface JobToSubmit{
    SSRNA_FASTA: File; DSDNA_FASTA: File;
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