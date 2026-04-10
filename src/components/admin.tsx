import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  Wallet,
} from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useWalletConnection } from "@solana/react-hooks";
import {
  adminCreateChallengeRef,
  adminCreateArticleRef,
  adminCreateEpisodeRef,
  adminDeleteArticleRef,
  adminDeleteEpisodeRef,
  adminGenerateUploadUrlRef,
  adminGetAdminGateRef,
  adminGetDashboardDataRef,
  adminUpdateArticleRef,
  adminUpdateEpisodeRef,
  articleToForm,
  classNames,
  compressImageForUpload,
  emptyArticleForm,
  emptyEpisodeForm,
  episodeToForm,
  parseLinks,
  parseTopics,
  type SignedAdminAuth,
  type AdminArticle,
  type AdminEpisode,
  type ArticleFormState,
  type DashboardData,
  type EpisodeFormState,
} from "../lib/admin";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 font-barlow text-[10px] uppercase tracking-[0.24em] text-[#c8b89d]">
      {children}
    </div>
  );
}

function DashboardPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-white/8 bg-[#15110d]/94 p-5 shadow-panel">
      <h2 className="font-inter text-[20px] font-semibold text-[#f5ecdc]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  confirmTone = "default",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  confirmTone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-[460px] rounded-[24px] border border-white/10 bg-[#15110d] p-6 shadow-panel">
        <h3 className="font-inter text-[22px] font-semibold text-[#f5ecdc]">
          {title}
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-[#8f7f6a]">
          {body}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#8f7f6a]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={classNames(
              "rounded-full px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em]",
              confirmTone === "danger"
                ? "border border-[#d7a16d]/20 bg-[#d7a16d]/12 text-[#f5ecdc]"
                : "border border-[#a9c9bf]/20 bg-[#a9c9bf]/10 text-[#f5ecdc]",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const { connect, connectors, disconnect, isReady, status, wallet } =
    useWalletConnection();
  const gate = useQuery(adminGetAdminGateRef, {}) as
    | { adminAddress: string; enabled: boolean }
    | undefined;
  const data = useQuery(adminGetDashboardDataRef, {}) as
    | DashboardData
    | undefined;
  const createChallenge = useMutation(adminCreateChallengeRef);
  const createEpisode = useAction(adminCreateEpisodeRef);
  const updateEpisode = useAction(adminUpdateEpisodeRef);
  const deleteEpisode = useAction(adminDeleteEpisodeRef);
  const createArticle = useAction(adminCreateArticleRef);
  const updateArticle = useAction(adminUpdateArticleRef);
  const deleteArticle = useAction(adminDeleteArticleRef);
  const generateUploadUrl = useAction(adminGenerateUploadUrlRef);

  const [episodeDraft, setEpisodeDraft] =
    useState<EpisodeFormState>(emptyEpisodeForm);
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [articleDraft, setArticleDraft] =
    useState<ArticleFormState>(emptyArticleForm);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [articleImagePreview, setArticleImagePreview] = useState<string | null>(
    null,
  );
  const [existingArticleImageId, setExistingArticleImageId] = useState<
    string | undefined
  >();
  const [removeExistingArticleImage, setRemoveExistingArticleImage] =
    useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    body: string;
    confirmLabel: string;
    confirmTone?: "default" | "danger";
    action: () => Promise<void> | void;
  } | null>(null);
  const articleImageInputRef = useRef<HTMLInputElement | null>(null);

  const episodes = data?.episodes ?? [];
  const articles = data?.articles ?? [];
  const connectedAddress = wallet?.account.address
    ? String(wallet.account.address)
    : undefined;
  const isAuthorizedWallet =
    Boolean(gate?.enabled) &&
    Boolean(connectedAddress) &&
    connectedAddress === gate?.adminAddress;

  const signAdminAction = async (action: string): Promise<SignedAdminAuth> => {
    if (!wallet?.signMessage || !connectedAddress) {
      throw new Error("Connected wallet does not support message signing.");
    }
    const challenge = await createChallenge({
      address: connectedAddress,
      action,
    });
    const signature = await wallet.signMessage(
      new TextEncoder().encode(challenge.message),
    );
    return {
      address: challenge.address,
      nonce: challenge.nonce,
      message: challenge.message,
      signature: Array.from(signature),
    };
  };

  const resetEpisodeForm = () => {
    setEditingEpisodeId(null);
    setEpisodeDraft(emptyEpisodeForm);
  };

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArticleDraft(emptyArticleForm);
    setArticleImageFile(null);
    setArticleImagePreview(null);
    setExistingArticleImageId(undefined);
    setRemoveExistingArticleImage(false);
    if (articleImageInputRef.current) {
      articleImageInputRef.current.value = "";
    }
  };

  const onEpisodeField =
    (field: keyof EpisodeFormState) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setEpisodeDraft((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const onArticleField =
    (field: keyof ArticleFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setArticleDraft((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const editEpisode = (episode: AdminEpisode) => {
    setEditingEpisodeId(episode._id);
    setEpisodeDraft(episodeToForm(episode));
  };

  const editArticle = (article: AdminArticle) => {
    setEditingArticleId(article._id);
    setArticleDraft(articleToForm(article));
    setArticleImageFile(null);
    setArticleImagePreview(article.imageUrl);
    setExistingArticleImageId(article.imageStorageId);
    setRemoveExistingArticleImage(false);
    if (articleImageInputRef.current) {
      articleImageInputRef.current.value = "";
    }
  };

  const handleEpisodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      number: Number(episodeDraft.number),
      issue: episodeDraft.issue.trim(),
      dateLabel: episodeDraft.dateLabel.trim(),
      dateISO: episodeDraft.dateISO.trim(),
      title: episodeDraft.title.trim(),
      subtitle: episodeDraft.subtitle.trim(),
      summary: episodeDraft.summary.trim(),
      year: Number(episodeDraft.year),
      series: episodeDraft.series,
      archiveState: episodeDraft.archiveState,
      topics: parseTopics(episodeDraft.topicsText),
      links: parseLinks(episodeDraft.linksText),
    };

    setConfirmState({
      title: editingEpisodeId ? "Update session?" : "Create session?",
      body: editingEpisodeId
        ? `This will update ${payload.issue} in the archive.`
        : `This will create ${payload.issue || "a new session"} in the archive.`,
      confirmLabel: editingEpisodeId ? "Yes, update" : "Yes, create",
      action: async () => {
        setBusy("episode");
        try {
          const auth = await signAdminAction(
            editingEpisodeId ? "updateEpisode" : "createEpisode",
          );
          if (editingEpisodeId) {
            await updateEpisode({ auth, id: editingEpisodeId as never, ...payload });
          } else {
            await createEpisode({ auth, ...payload });
          }
          resetEpisodeForm();
        } finally {
          setBusy(null);
        }
      },
    });
  };

  const handleArticleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      title: articleDraft.title.trim(),
      slug: articleDraft.slug.trim() || undefined,
      dateLabel: articleDraft.dateLabel.trim(),
      dateISO: articleDraft.dateISO.trim(),
      excerpt: articleDraft.excerpt.trim(),
      articleUrl: articleDraft.articleUrl.trim(),
      sourceLabel: articleDraft.sourceLabel.trim(),
    };

    setConfirmState({
      title: editingArticleId ? "Update article?" : "Create article?",
      body: editingArticleId
        ? `This will update "${payload.title}" and refresh its public article card.`
        : `This will create "${payload.title}" and add it to the article section.`,
      confirmLabel: editingArticleId ? "Yes, update" : "Yes, create",
      action: async () => {
        setBusy("article");
        try {
          const uploadAuth = await signAdminAction("generateUploadUrl");
          const uploadedStorageId = articleImageFile
            ? await (async () => {
                const optimizedFile = await compressImageForUpload(articleImageFile);
                const postUrl = await generateUploadUrl({ auth: uploadAuth });
                const result = await fetch(postUrl, {
                  method: "POST",
                  headers: { "Content-Type": optimizedFile.type },
                  body: optimizedFile,
                });
                const { storageId } = (await result.json()) as {
                  storageId: string;
                };
                return storageId;
              })()
            : undefined;
          const auth = await signAdminAction(
            editingArticleId ? "updateArticle" : "createArticle",
          );
          if (editingArticleId) {
            await updateArticle({
              auth,
              id: editingArticleId as never,
              ...payload,
              imageStorageId: uploadedStorageId ?? existingArticleImageId,
              removeImage: removeExistingArticleImage,
            });
          } else {
            await createArticle({
              auth,
              ...payload,
              imageStorageId: uploadedStorageId,
            });
          }
          resetArticleForm();
        } finally {
          setBusy(null);
        }
      },
    });
  };

  if (!isReady || !gate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0b09] px-6 text-[#f5ecdc]">
        <div className="rounded-[24px] border border-white/8 bg-[#15110d]/94 p-8 shadow-panel">
          <div className="flex items-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#d6a06b]" />
            <span className="text-[14px] text-[#c8b89d]">Loading admin gate...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!wallet || !isAuthorizedWallet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0b09] px-6 text-[#f5ecdc]">
        <div className="w-full max-w-[520px] rounded-[28px] border border-white/8 bg-[#15110d]/94 p-8 text-center shadow-panel">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d6a06b]/20 bg-[#d6a06b]/10">
            <Wallet className="h-6 w-6 text-[#eadcc2]" />
          </div>
          <h1 className="mt-5 font-inter text-[28px] font-semibold tracking-[-0.04em]">
            Connect admin wallet
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#8f7f6a]">
            `/admin` is wallet-gated. Connect the allowlisted Solana wallet and sign action challenges
            before any write is accepted by Convex.
          </p>

          <div className="mt-6 space-y-3">
            {wallet && !isAuthorizedWallet && (
              <div className="rounded-[16px] border border-[#d7a16d]/16 bg-[#d7a16d]/8 px-4 py-3 text-left">
                <div className="font-barlow text-[10px] uppercase tracking-[0.18em] text-[#c8b89d]">
                  Connected wallet
                </div>
                <div className="mt-2 break-all font-mono text-[12px] text-[#f5ecdc]">
                  {connectedAddress}
                </div>
                <div className="mt-2 text-[12px] text-[#8f7f6a]">
                  This wallet is not the allowlisted admin address.
                </div>
              </div>
            )}

            {connectors.length ? (
              connectors.map((connector) => (
                <button
                  key={connector.id}
                  type="button"
                  onClick={() => connect(connector.id)}
                  disabled={status === "connecting"}
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.05]"
                >
                  <div>
                    <div className="font-inter text-[14px] font-semibold text-[#f5ecdc]">
                      {connector.name}
                    </div>
                    <div className="mt-1 text-[11px] text-[#8f7f6a]">{connector.id}</div>
                  </div>
                  {status === "connecting" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin text-[#d6a06b]" />
                  ) : (
                    <ArrowLeft className="h-4 w-4 rotate-180 text-[#d6a06b]" />
                  )}
                </button>
              ))
            ) : (
              <div className="rounded-[16px] border border-white/8 bg-white/[0.02] px-4 py-4 text-[13px] text-[#8f7f6a]">
                No wallet-standard connector detected in this browser.
              </div>
            )}
          </div>

          {wallet && (
            <button
              type="button"
              onClick={() => disconnect()}
              className="mt-5 rounded-full border border-white/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#8f7f6a]"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0b09] px-6 py-8 text-[#f5ecdc]">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <SectionLabel>Admin</SectionLabel>
            <h1 className="font-inter text-[32px] font-semibold tracking-[-0.04em]">
              the_anchor_founder dashboard
            </h1>
            <p className="mt-2 max-w-[700px] text-[13px] leading-relaxed text-[#8f7f6a]">
              Minimal archive control surface for sessions and article cards.
              Sessions stay link-based with X and YouTube URLs. Article
              screenshots can be uploaded into Convex storage.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#a9c9bf]/20 bg-[#a9c9bf]/10 px-3 py-1.5 font-barlow text-[10px] uppercase tracking-[0.18em] text-[#f5ecdc]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Signed admin actions active
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded-full border border-white/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#8f7f6a]"
            >
              Disconnect
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#f5ecdc]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </a>
          </div>
        </div>

        <div className="grid grid-cols-[1.05fr_1.45fr] gap-6">
          <DashboardPanel title="Sessions">
            <div className="grid grid-cols-[320px_1fr] gap-5">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={resetEpisodeForm}
                  className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#d6a06b]/18 bg-[#d6a06b]/10 px-3 py-3 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#eadcc2]"
                >
                  <Plus className="h-4 w-4" />
                  New session
                </button>

                <div className="max-h-[720px] space-y-2 overflow-auto pr-1">
                  {episodes.map((episode) => (
                    <div
                      key={episode._id}
                      className={classNames(
                        "rounded-[16px] border px-4 py-3",
                        editingEpisodeId === episode._id
                          ? "border-[#a9c9bf]/30 bg-[#a9c9bf]/8"
                          : "border-white/8 bg-white/[0.02]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-barlow text-[10px] uppercase tracking-[0.18em] text-[#c8b89d]">
                            {episode.issue} • {episode.dateLabel}
                          </div>
                          <div className="mt-1 font-inter text-[13px] font-semibold text-[#f5ecdc]">
                            {episode.subtitle}
                          </div>
                          <div className="mt-1 text-[11px] text-[#8f7f6a]">
                            {episode.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => editEpisode(episode)}
                            className="rounded-full border border-white/10 p-2 text-[#f5ecdc]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmState({
                                title: "Delete session?",
                                body: `This will permanently delete ${episode.issue} from the archive.`,
                                confirmLabel: "Yes, delete",
                                confirmTone: "danger",
                                action: async () => {
                                  setBusy(`delete-episode-${episode._id}`);
                                  try {
                                    const auth = await signAdminAction("deleteEpisode");
                                    await deleteEpisode({ auth, id: episode._id as never });
                                    if (editingEpisodeId === episode._id) {
                                      resetEpisodeForm();
                                    }
                                  } finally {
                                    setBusy(null);
                                  }
                                },
                              });
                            }}
                            className="rounded-full border border-white/10 p-2 text-[#d7a16d]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleEpisodeSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">
                      Number
                    </span>
                    <input value={episodeDraft.number} onChange={onEpisodeField("number")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">
                      Issue label
                    </span>
                    <input value={episodeDraft.issue} onChange={onEpisodeField("issue")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">
                      Date label
                    </span>
                    <input value={episodeDraft.dateLabel} onChange={onEpisodeField("dateLabel")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">
                      Date ISO
                    </span>
                    <input type="date" value={episodeDraft.dateISO} onChange={onEpisodeField("dateISO")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">
                      Series
                    </span>
                    <select value={episodeDraft.series} onChange={onEpisodeField("series")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none">
                      <option value="issue">Issue</option>
                      <option value="spotlight">Spotlight</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">
                      Archive state
                    </span>
                    <select value={episodeDraft.archiveState} onChange={onEpisodeField("archiveState")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none">
                      <option value="available">Available</option>
                      <option value="x_removed">X removed</option>
                    </select>
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Title</span>
                  <input value={episodeDraft.title} onChange={onEpisodeField("title")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Subtitle</span>
                  <input value={episodeDraft.subtitle} onChange={onEpisodeField("subtitle")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Summary</span>
                  <textarea value={episodeDraft.summary} onChange={onEpisodeField("summary")} rows={4} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                </label>
                <div className="grid grid-cols-[1fr_160px] gap-4">
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Topics</span>
                    <input value={episodeDraft.topicsText} onChange={onEpisodeField("topicsText")} placeholder="Anchor, Pinocchio, LiteSVM" className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Year</span>
                    <input value={episodeDraft.year} onChange={onEpisodeField("year")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Links</span>
                  <textarea value={episodeDraft.linksText} onChange={onEpisodeField("linksText")} rows={4} placeholder="x|X Broadcast|https://x.com/...
youtube|YouTube|https://youtube.com/..." className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs outline-none" />
                </label>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={busy === "episode"} className="inline-flex items-center gap-2 rounded-full border border-[#a9c9bf]/20 bg-[#a9c9bf]/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#f5ecdc]">
                    <Save className="h-4 w-4" />
                    {editingEpisodeId ? "Update session" : "Create session"}
                  </button>
                  <button type="button" onClick={resetEpisodeForm} className="rounded-full border border-white/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#8f7f6a]">
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </DashboardPanel>

          <DashboardPanel title="Articles">
            <div className="grid grid-cols-[320px_1fr] gap-5">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={resetArticleForm}
                  className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#d6a06b]/18 bg-[#d6a06b]/10 px-3 py-3 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#eadcc2]"
                >
                  <Plus className="h-4 w-4" />
                  New article
                </button>

                <div className="max-h-[720px] space-y-2 overflow-auto pr-1">
                  {articles.map((article) => (
                    <div
                      key={article._id}
                      className={classNames(
                        "rounded-[16px] border px-4 py-3",
                        editingArticleId === article._id
                          ? "border-[#a9c9bf]/30 bg-[#a9c9bf]/8"
                          : "border-white/8 bg-white/[0.02]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-barlow text-[10px] uppercase tracking-[0.18em] text-[#c8b89d]">
                            {article.dateLabel}
                          </div>
                          <div className="mt-1 font-inter text-[13px] font-semibold text-[#f5ecdc]">
                            {article.title}
                          </div>
                          <div className="mt-1 text-[11px] text-[#8f7f6a]">
                            {article.sourceLabel}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => editArticle(article)}
                            className="rounded-full border border-white/10 p-2 text-[#f5ecdc]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmState({
                                title: "Delete article?",
                                body: `This will permanently delete "${article.title}" and remove its stored image if it has one.`,
                                confirmLabel: "Yes, delete",
                                confirmTone: "danger",
                                action: async () => {
                                  setBusy(`delete-article-${article._id}`);
                                  try {
                                    const auth = await signAdminAction("deleteArticle");
                                    await deleteArticle({ auth, id: article._id as never });
                                    if (editingArticleId === article._id) {
                                      resetArticleForm();
                                    }
                                  } finally {
                                    setBusy(null);
                                  }
                                },
                              });
                            }}
                            className="rounded-full border border-white/10 p-2 text-[#d7a16d]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleArticleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Title</span>
                    <input value={articleDraft.title} onChange={onArticleField("title")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Slug</span>
                    <input value={articleDraft.slug} onChange={onArticleField("slug")} placeholder="optional" className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Date label</span>
                    <input value={articleDraft.dateLabel} onChange={onArticleField("dateLabel")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Date ISO</span>
                    <input type="date" value={articleDraft.dateISO} onChange={onArticleField("dateISO")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                </div>
                <div className="grid grid-cols-[1fr_180px] gap-4">
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Article URL</span>
                    <input value={articleDraft.articleUrl} onChange={onArticleField("articleUrl")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Source label</span>
                    <input value={articleDraft.sourceLabel} onChange={onArticleField("sourceLabel")} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#8f7f6a]">Excerpt</span>
                  <textarea value={articleDraft.excerpt} onChange={onArticleField("excerpt")} rows={5} className="w-full rounded-[14px] border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" />
                </label>
                <div className="rounded-[18px] border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-barlow text-[10px] uppercase tracking-[0.18em] text-[#c8b89d]">
                        Article image
                      </div>
                      <p className="mt-1 text-[12px] text-[#8f7f6a]">
                        Upload the screenshot/artwork for the article card.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#a9c9bf]/20 bg-[#a9c9bf]/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#f5ecdc]">
                      <ImagePlus className="h-4 w-4" />
                      Choose image
                      <input
                        ref={articleImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setArticleImageFile(file);
                          setRemoveExistingArticleImage(false);
                          if (file) {
                            setArticleImagePreview(URL.createObjectURL(file));
                          } else {
                            setArticleImagePreview(null);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {(articleImagePreview || existingArticleImageId) && (
                    <div className="mt-4 space-y-3">
                      <div className="overflow-hidden rounded-[16px] border border-white/8 bg-black/20">
                        {articleImagePreview ? (
                          <img
                            src={articleImagePreview}
                            alt="Article preview"
                            className="h-56 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-56 items-center justify-center text-[#8f7f6a]">
                            Existing image will remain
                          </div>
                        )}
                      </div>
                      {editingArticleId && (
                        <label className="inline-flex items-center gap-2 text-[12px] text-[#c8b89d]">
                          <input
                            type="checkbox"
                            checked={removeExistingArticleImage}
                            onChange={(event) =>
                              setRemoveExistingArticleImage(event.target.checked)
                            }
                          />
                          Remove current image on save
                        </label>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={busy === "article"} className="inline-flex items-center gap-2 rounded-full border border-[#a9c9bf]/20 bg-[#a9c9bf]/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#f5ecdc]">
                    <Save className="h-4 w-4" />
                    {editingArticleId ? "Update article" : "Create article"}
                  </button>
                  <button type="button" onClick={resetArticleForm} className="rounded-full border border-white/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#8f7f6a]">
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </DashboardPanel>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title ?? ""}
        body={confirmState?.body ?? ""}
        confirmLabel={confirmState?.confirmLabel ?? "Confirm"}
        confirmTone={confirmState?.confirmTone}
        onCancel={() => setConfirmState(null)}
        onConfirm={async () => {
          if (!confirmState) {
            return;
          }
          const action = confirmState.action;
          setConfirmState(null);
          await action();
        }}
      />
    </div>
  );
}

export function AdminUnavailable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0b09] px-6 text-[#f5ecdc]">
      <div className="max-w-[620px] rounded-[24px] border border-white/8 bg-[#15110d]/94 p-8 text-center shadow-panel">
        <h1 className="font-inter text-[28px] font-semibold">
          Convex connection required
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[#8f7f6a]">
          The admin surface needs `VITE_CONVEX_URL` so it can query and mutate
          your archive data.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#f5ecdc]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </a>
      </div>
    </div>
  );
}
