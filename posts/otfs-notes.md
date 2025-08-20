# Notes on OTFS Channel Estimation

Some quick bullets I keep handy:

1. Delay–Doppler sparsity enables compressed-sensing style recovery.
2. Fractional Doppler/Delay requires careful basis design and leakage mitigation.
3. Practical estimators I’ve tried: OMP, SL0, and a custom GP‑SOONE variant.

For the *pilot pattern*, I like a comb structure with guard tones. A simple model:

$$
r[k,l] = \sum_{p=1}^{P} h_p e^{j2\pi\nu_p k} \delta[l-\tau_p] + w[k,l].
$$

More later.